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
    const extractedLimit = extractLimit(sqlQuery);
    if (extractedLimit) {
      loggerLanguageToSQL.info(
        `Row limit extracted from the LIMIT clause: ${extractedLimit}`
      );
      return extractedLimit;
    }

    // Call GPT for a proper query
    let { expectedRowCount, countingSqlQuery } = await generateGPTAnswer(
      promptForCountingSQL(sqlQuery),
      countingSqlResponseSchema,
      "counting_sql_response"
    );
    if (expectedRowCount) {
      loggerLanguageToSQL.info(`GPT directly inferred the expected row count.`);
      return expectedRowCount;
    }
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
    expectedRowCount = Number(rows?.[0]?.row_count);
    if (!expectedRowCount) {
      throw new AppError("Failed to fetch the row_count from the db.");
    }
    return expectedRowCount;
  } catch (error) {
    loggerLanguageToSQL.error("❌ Error checking expected row count.");
    throw error;
  }
}

function extractLimit(sqlQuery) {
  const limitRegex = /LIMIT\s+(\d+);/i;
  const match = sqlQuery.match(limitRegex);

  // If a match is found, return the limit as a number, otherwise return null
  return match ? Number(match[1]) : null;
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
