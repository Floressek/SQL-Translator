import express from "express";
import {
  generateGPTAnswer,
  sqlResponse,
  finalResponse,
} from "../../OpenAI/openAI.js";
import { promptForSQL, promptForAnswer } from "../../OpenAI/prompts.js";
import { asyncWrapper } from "../../Utils/asyncWrapper.js";
import { executeSQL } from "../../Database/mysql.js";
import { loggerLanguageToSQL } from "../../Utils/logger.js";
import { JWTverificator } from "../../Utils/Middleware/JWTverificator.js";
import { MAX_ROWS_DEFAULT } from "../../Constants/constants.js";
import { ERR_CODES } from "../../Constants/StatusCodes/errorCodes.js";
import { WRN_CODES } from "../../Constants/StatusCodes/warningCodes.js";
import { querySchema } from "../inputTypes.js";

export const mainRouter = express.Router();

// TODO: Add implementations for: cacheFailedQuery(), fetchCachedAnswer(), checkRowCount(), appendLimitClause()

mainRouter.post(
  "/language-to-sql",
  JWTverificator,
  asyncWrapper(async (req, res) => {
    loggerLanguageToSQL.info("📩 Received a new POST request.");
    const reqParsed = querySchema.parse(req.body);

    // ===========================================================================
    // Initialize required variables
    let sqlQueryFinal;
    let sqlQueryFormatted;

    const userQuery = reqParsed.userQuery;
    const maxRows = reqParsed.limitStrategy?.maxRows || MAX_ROWS_DEFAULT;
    const forceLimit = reqParsed.limitStrategy?.forceLimit || false;
    // console.log(promptForSQL(userQuery));

    // ===========================================================================
    // Call OpenAI to translate natural language to SQL
    let expectedRowCount;
    let sqlAnswer;
    if (reqParsed.cacheStrategy?.useCached) {
      ({ sqlAnswer, expectedRowCount } = fetchCachedAnswer());
      loggerLanguageToSQL.info(
        `🤖 Generated SQL (fetched from cache): ${sqlAnswer.sqlQuery}`
      );
      loggerLanguageToSQL.info(
        `Expected row count (fetched from cache): ${sqlAnswer.sqlQuery}`
      );
    } else {
      sqlAnswer = await generateGPTAnswer(
        promptForSQL(userQuery),
        sqlResponse,
        "sql_response"
      );
      loggerLanguageToSQL.info(`🤖 Generated SQL: ${sqlAnswer.sqlQuery}`);

      expectedRowCount = checkRowCount(sqlAnswer.sqlQuery);
      loggerLanguageToSQL.info(`Expected row count: ${sqlAnswer.sqlQuery}`);
    }

    if (!sqlAnswer.isSelect) {
      res.status(400).json({
        status: "error",
        errorCode: ERR_CODES.UNSUPPORTED_QUERY_ERR,
      });

      return;
    }

    // ===========================================================================
    // Check row count
    if (expectedRowCount <= maxRows) {
      sqlQueryFinal = sqlAnswer.sqlQuery;
      sqlQueryFormatted = sqlAnswer.sqlQueryFormatted;
    } else if (forceLimit) {
      // Append the limit clause & initialize warning message, then continue processing
      ({ sqlQueryFinal, sqlQueryFormatted } = appendLimitCluase(
        sqlAnswer.sqlQuery
      ));

      const warning = {
        warningCode: WRN_CODES.TRUNCATED_RECORDS_WRN,
        warningDetails: {
          expectedRowCount: expectedRowCount,
          rowLimit: rowLimit,
        },
      };
    } else {
      if (reqParsed.cacheStrategy?.cacheFailed) {
        cacheFailedQuery(userQuery, sqlAnswer, expectedRowCount);
      }
      // Respond with error & include generated SQL query
      res.status(400).json({
        status: "error",
        errorCode: ERR_CODES.TO_MANY_ROWS_ERR,
        errorDetails: {
          expectedRowCount: expectedRowCount,
          maxRows: maxRows,
        },
        data: {
          sqlQuery: sqlAnswer.sqlQuery,
          sqlQueryFormatted: sqlAnswer.sqlQueryFormatted,
        },
      });
    }

    // ===========================================================================
    // Execute the generated SQL query
    const rows = await executeSQL(sqlQueryFinal);

    // ===========================================================================
    // Call OpenAI to format the result
    const formattedAnswer = await generateGPTAnswer(
      promptForAnswer(userQuery, sqlQueryFinal, rows),
      finalResponse,
      "final_response"
    );

    // ===========================================================================
    // Send back the response
    const responseBody = {
      status: "success",
      data: {
        sqlQueryFormatted: sqlQueryFormatted,
        formattedAnswer: formattedAnswer.formattedAnswer,
        rawData: rows,
      },
    };
    if (warning) {
      responseBody.warning = warning;
    }
    res.status(200).json(responseBody);
    loggerLanguageToSQL.info("✅ Successfully processed the request!");
  })
);
