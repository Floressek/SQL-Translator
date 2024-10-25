import express from "express";
import {
  generateGPTAnswer,
  sqlResponse,
  finalResponse,
} from "../OpenAI/openAI.js";
import { promptForSQL, promptForAnswer } from "../OpenAI/prompts.js";
import { asyncWrapper } from "../Utils/asyncWrapper.js";
import { executeSQL } from "../Database/mysql.js";
import { loggerLanguageToSQL } from "../Utils/logger.js";
import { JWTverificator } from "../Utils/Middleware/JWTverificator.js";
import { DEFAULT_ROW_LIMIT } from "../Constants/constants.js";
import { ERR_CODES } from "../Constants/StatusCodes/errorCodes.js";
import { WRN_CODES } from "../Constants/StatusCodes/warningCodes.js";

export const mainRouter = express.Router();

// TODO: Add param verification middleware
// TODO: Add implementations for: verifySelect(), checkRowCount(), appendLimitClause()

mainRouter.post(
  "/language-to-sql",
  JWTverificator,
  asyncWrapper(async (req, res) => {
    loggerLanguageToSQL.info("📩 Received a new POST request.");

    let sqlQueryFinal;
    let sqlQueryFormatted;

    // ===========================================================================
    // Initialize required variables
    const userQuery = req.body?.userQuery;
    const sqlAnswerPrevious = req.body?.sqlAnswerPrevious;
    const rowLimit =
      req.body?.rowLimit && typeof req.body?.rowLimit === "number"
        ? req.body?.rowLimit
        : DEFAULT_ROW_LIMIT;
    const forceLimit = !!req.body?.forceLimit;
    // console.log(promptForSQL(userQuery));

    if (!userQuery) {
      res.status(400).json({ status: "error", errorCode: ERR_CODES.NO_QUERY_ERR });

      return;
    }
    if (sqlAnswerPrevious) {
      // Check if sqlAnswerPrevious is a valid object with required properties
      const isSqlAnswerPreviousValid =
        typeof sqlAnswerPrevious === "object" &&
        typeof sqlAnswerPrevious.sqlQuery === "string" &&
        typeof sqlAnswerPrevious.sqlQueryFormatted === "string";

      if (isSqlAnswerPreviousValid) {
        sqlAnswerPrevious.isSelect = verifySelect(sqlAnswerPrevious?.sqlQuery);
      } else {
        return res.status(400).json({
          status: "error",
          errorCode: ERR_CODES.INVALID_PARAM_ERR,
          errorDetails: {
            invalidParam: "sqlAnswerPrevious",
          },
        });
      }
    }

    // ===========================================================================
    // Call OpenAI to translate natural language to SQL
    const sqlAnswer = sqlAnswerPrevious
      ? sqlAnswerPrevious
      : await generateGPTAnswer(
          promptForSQL(userQuery),
          sqlResponse,
          "sql_response"
        );
    loggerLanguageToSQL.info(
      `${
        sqlAnswerPrevious
          ? "🤖 SQL received from the client in sqlAnswerPrevious"
          : "🤖 Generated SQL"
      }: ${sqlAnswer.sqlQuery}`
    );

    if (!sqlAnswer.isSelect) {
      res.status(400).json({
        status: "error",
        errorCode: ERR_CODES.UNSUPPORTED_QUERY_ERR,
      });

      return;
    }

    // ===========================================================================
    // Check row count
    const expectedRowCount = checkRowCount(sqlAnswer.sqlQuery);
    if (expectedRowCount <= rowLimit) {
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
      // Respond with error & include generated query
      res.status(400).json({
        status: "error",
        errorCode: ERR_CODES.TO_MANY_ROWS_ERR,
        errorDetails: {
          expectedRowCount: expectedRowCount,
          rowLimit: rowLimit,
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
