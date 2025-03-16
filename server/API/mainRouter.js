import express from "express";
import {
  generateGPTAnswer,
  sqlResponse,
  finalResponse,
} from "../OpenAI/openAI.js";
import { promptForSQL, promptForAnswer } from "../OpenAI/prompts.js";
import { asyncWrapper } from "../Utils/asyncWrapper.js";
import { executeSQL } from "../Database/mysql.js";
import {createLogger} from "../Utils/logger.js";
const logger = createLogger(__filename);

export const mainRouter = express.Router();

mainRouter.post(
  "/language-to-sql",
  d(async (req, res) => {
    logger.info("📩 Received a new POST request.");

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
    logger.info(`🤖 Generated SQL: ${sqlAnswer.sqlStatement}`);

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
    logger.info("✅ Successfully processed the request!");
  })
);
