import express from "express";
import { generateGPTAnswer } from "../../OpenAI/openAI.js";
import {
  sqlResponseSchema,
  finalResponseSchema,
} from "../../OpenAI/responseSchemas.js";
import { promptForSQL, promptForAnswer } from "../../OpenAI/prompts.js";
import { asyncWrapper } from "../../Utils/asyncWrapper.js";
import { executeSQL } from "../../Database/mysql.js";
import { loggerLanguageToSQL } from "../../Utils/logger.js";
import { JWTverificator } from "../../Utils/Middleware/JWTverificator.js";
import { MAX_ROWS_DEFAULT, NODE_ENV } from "../../Constants/constants.js";
import { ERR_CODES } from "../../Constants/StatusCodes/errorCodes.js";
import { WRN_CODES } from "../../Constants/StatusCodes/warningCodes.js";
import { querySchema } from "./inputSchemas.js";
import { checkRowCount, appendLimitClause } from "./mainUtils.js";
import { AppError } from "../../Utils/AppError.js";

export const mainRouter = express.Router();

// TODO: Add implementations for: cacheFailedQuery(), fetchCachedAnswer()

mainRouter.post(
  "/language-to-sql",
  JWTverificator,
  asyncWrapper(async (req, res) => {
    loggerLanguageToSQL.info("📩 Received a new POST request.");
    const reqParsed = querySchema.parse(req.body);

    // ===========================================================================
    // Initialize required variables
    let warning;
    let sqlQueryFinal;
    let sqlQueryFormatted;

    const userQuery = reqParsed.userQuery;
    const maxRows = reqParsed.limitStrategy?.maxRows || MAX_ROWS_DEFAULT;
    const forceLimit = reqParsed.limitStrategy?.forceLimit || false;
    // console.log(promptForSQL(userQuery));

    let expectedRowCount;
    let sqlAnswer;
    // ===========================================================================
    // Fetch cached transalation & expectedRowCount
    if (reqParsed.cacheStrategy?.useCached) {
      ({ sqlAnswer, expectedRowCount } = fetchCachedAnswer());

      loggerLanguageToSQL.info(
        `🤖 Generated SQL (fetched from cache):\n${sqlAnswer.sqlQuery}`
      );
      loggerLanguageToSQL.info(
        `Expected row count (fetched from cache): ${sqlAnswer.sqlQuery}`
      );
    } else {
      // ===========================================================================
      // Call OpenAI to translate natural language to SQL & obtain expectedRowCount
      sqlAnswer = await generateGPTAnswer(
        promptForSQL(userQuery),
        sqlResponseSchema,
        "sql_response"
      );
      if (!sqlAnswer.sqlQuery || !sqlAnswer.sqlQueryFormatted) {
        throw new AppError(
          "GPT failed to generate a meaningful SQL translation."
        );
      }
      if (!sqlAnswer.isSelect) {
        res.status(400).json({
          status: "error",
          errorCode: ERR_CODES.UNSUPPORTED_QUERY_ERR,
        });

        return;
      }
      loggerLanguageToSQL.info(`🤖 Generated SQL: ${sqlAnswer.sqlQuery}`);

      expectedRowCount = await checkRowCount(sqlAnswer.sqlQuery);
      loggerLanguageToSQL.info(
        `Expected row count: ${expectedRowCount} `
      );
    }

    // ===========================================================================
    // Check maxRows limit
    if (expectedRowCount <= maxRows) {
      sqlQueryFinal = sqlAnswer.sqlQuery;
      sqlQueryFormatted = sqlAnswer.sqlQueryFormatted;
    } else if (forceLimit) {
      // Append the limit clause & initialize warning message, then continue processing
      const { limitedSqlQuery, limitedSqlQueryFormatted } =
        await appendLimitClause(sqlAnswer.sqlQuery, maxRows);
      sqlQueryFinal = limitedSqlQuery;
      sqlQueryFormatted = limitedSqlQueryFormatted;

      warning = {
        warningCode: WRN_CODES.TRUNCATED_RECORDS_WRN,
        warningDetails: {
          expectedRowCount,
          maxRowsAllowed: maxRows,
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

      return;
    }
    // ===========================================================================
    // Execute the generated SQL query
    const rows = await executeSQL(sqlQueryFinal);

    // ===========================================================================
    // Call OpenAI to format the result
    const { formattedAnswer } = await generateGPTAnswer(
      promptForAnswer(userQuery, sqlQueryFinal, rows),
      finalResponseSchema,
      "final_response"
    );

    // ===========================================================================
    // Send back the response
    const responseBody = {
      status: "success",
      data: {
        sqlQueryFormatted: ["production", "frontend_testing"].includes(NODE_ENV)
          ? sqlQueryFormatted
          : sqlQueryFinal,
        formattedAnswer,
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
