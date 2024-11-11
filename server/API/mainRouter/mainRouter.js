import express from "express";
import { generateGPTAnswer } from "../../OpenAI/openAI.js";
import {
  sqlResponseSchema,
  finalResponseSchema,
} from "../../OpenAI/LLMschemas.js";
import { promptForSQL, promptForAnswer } from "../../OpenAI/prompts.js";
import { asyncWrapper } from "../../Utils/asyncWrapper.js";
import { executeSQL } from "../../Database/mysql.js";
import { loggerLanguageToSQL } from "../../Utils/logger.js";
import { JWTverificator } from "../../Utils/Middleware/JWTverificator.js";
import { NODE_ENV } from "../../Constants/constants.js";
import { ERR_CODES } from "../../Constants/StatusCodes/errorCodes.js";
import { querySchema } from "./inputSchemas.js";
import { appendLimitClause } from "./mainUtils.js";
import { AppError } from "../../Utils/AppError.js";

export const mainRouter = express.Router();

mainRouter.post(
  "/language-to-sql",
  JWTverificator,
  asyncWrapper(async (req, res) => {
    loggerLanguageToSQL.info("📩 Received a new POST request.");
    const reqParsed = querySchema.parse(req.body);

    // ===========================================================================
    // Initialize required variables
    const userQuery = reqParsed.query;
    const rowLimit = reqParsed.rowLimit;

    // ===========================================================================
    // Call OpenAI to translate natural language to SQL
    const { isSelect, sqlQuery, sqlQueryFormatted } = await generateGPTAnswer(
      promptForSQL(userQuery),
      sqlResponseSchema,
      "sql_response"
    );
    if (!isSelect) {
      res.status(400).json({
        status: "error",
        errorCode: ERR_CODES.UNSUPPORTED_QUERY_ERR,
        data: {
          sqlQueryFormatted: sqlQueryFormatted,
        },
      });

      return;
    }
    if (!sqlQuery || !sqlQueryFormatted) {
      throw new AppError(
        "GPT failed to generate a meaningful SQL translation."
      );
    }
    loggerLanguageToSQL.info(`🤖 Generated SQL: ${sqlQuery}`);

    // ===========================================================================
    // Append LIMIT clause if needed:
    const { sqlQueryLimited, sqlQueryLimitedFormatted } = appendLimitClause(
      sqlQuery,
      sqlQueryFormatted,
      rowLimit
    );

    // ===========================================================================
    // Execute the generated SQL query
    const rows = await executeSQL(sqlQueryLimited);

    // ===========================================================================
    // Call OpenAI to format the result
    const { formattedAnswer } = await generateGPTAnswer(
      promptForAnswer(userQuery, sqlQueryLimited, rows),
      finalResponseSchema,
      "final_response"
    );

    // ===========================================================================
    // Send back the response
    const responseBody = {
      status: "success",
      data: {
        sqlQueryFormatted: sqlQueryLimitedFormatted,
        formattedAnswer,
        rowData: rows,
      },
    };
    res.status(200).json(responseBody);
    loggerLanguageToSQL.info("✅ Successfully processed the request!");
  })
);
