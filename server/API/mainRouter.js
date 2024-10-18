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

export const mainRouter = express.Router();

mainRouter.post(
  "/language-to-sql",
  JWTverificator,
  asyncWrapper(async (req, res) => {
    loggerLanguageToSQL.info("📩 Received a new POST request.");

    const userQuery = req.body?.query;
    // console.log(promptForSQL(userQuery));

    if (!userQuery) {
      res.status(400).json({ status: "error", errorCode: "NO_QUERY_ERR" });

      return;
    }

    // Call OpenAI to translate natural language to SQL
    const sqlAnswer = await generateGPTAnswer(
      promptForSQL(userQuery),
      sqlResponse,
      "sql_response"
    );
    loggerLanguageToSQL.info(`🤖 Generated SQL: ${sqlAnswer.sqlStatement}`);

    if (!sqlAnswer.isSelect) {
      res.status(400).json({
        status: "error",
        errorCode: "UNSUPPORTED_QUERY_ERR",
      });

      return;
    }

    // Execute the generated SQL query
    const rows = await executeSQL(sqlAnswer.sqlStatement);

    // Call OpenAI to format the result
    const formattedAnswer = await generateGPTAnswer(
      promptForAnswer(userQuery, sqlAnswer.sqlStatement, rows),
      finalResponse,
      "final_response"
    );

    // Send back the response
    res.status(200).json({
      status: "success",
      question: userQuery,
      sqlStatement: sqlAnswer.sqlStatement,
      formattedAnswer: formattedAnswer.formattedAnswer,
      rawData: rows,
    });
    loggerLanguageToSQL.info("✅ Successfully processed the request!");
  })
);
