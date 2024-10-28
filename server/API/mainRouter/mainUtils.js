import { executeSQL } from "../../Database/mysql.js";
import { generateGPTAnswer } from "../../OpenAI/openAI.js";
import {
  promptForCountingSQL,
  promptForLimitedSQL,
} from "../../OpenAI/prompts.js";
import {
  countingSqlResponseSchema,
  limitedSqlResponseSchema,
} from "../../OpenAI/responseSchemas.js";
import { AppError } from "../../Utils/AppError.js";
import { loggerLanguageToSQL } from "../../Utils/logger.js";

export async function checkRowCount(sqlQuery) {
  try {
    // Call GPT for a proper query
    const { countingSqlQuery } = await generateGPTAnswer(
      promptForCountingSQL(sqlQuery),
      countingSqlResponseSchema,
      "counting_sql_response"
    );
    if (!countingSqlQuery) {
      throw new AppError(
        "GPT failed to generate a meaningful query for rows counting."
      );
    }
    loggerLanguageToSQL.info(
      `🤖 Generated row-counting SQL:\n${countingSqlQuery} `
    );

    // Execute the query on MySQL database
    const rows = await executeSQL(countingSqlQuery);
    const expectedRowCount = Number(rows?.[0]?.row_count);
    if (!expectedRowCount) {
      throw new AppError("Failed to fetch the row_count from the db.");
    }
    return expectedRowCount;
  } catch (error) {
    loggerLanguageToSQL.error("❌ Error checking expected row count.");
    throw error;
  }
}

export async function appendLimitClause(sqlQuery, maxRows) {
  try {
    const { limitedSqlQuery, limitedSqlQueryFormatted } =
      await generateGPTAnswer(
        promptForLimitedSQL(sqlQuery, maxRows),
        limitedSqlResponseSchema,
        "limited_sql_response"
      );
    if (!limitedSqlQuery || !limitedSqlQueryFormatted) {
      throw new AppError("GPT failed to correctly append the LIMIT clause.");
    }
    loggerLanguageToSQL.info(
      `Successfully appended the LIMIT clause: ${limitedSqlQuery}`
    );
    return { limitedSqlQuery, limitedSqlQueryFormatted };
  } catch (error) {
    loggerLanguageToSQL.error("❌ Error appending the LIMIT clause.");
    throw error;
  }
}
