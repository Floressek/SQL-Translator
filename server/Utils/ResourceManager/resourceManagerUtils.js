import { executeSQL } from "../../Database/mysql.js";
import { loggerMySQL } from "../logger.js";
import { AppError } from "../AppError.js";

export async function getPromptCode() {
  const query = "SELECT prompt_code FROM code_blocks WHERE id = 1";
  const result = await executeSQL(query);
  try {
    if (result && result.length > 0 && result[0].prompt_code) {
      loggerMySQL.info(`Prompt code fetched from the db.`);
      return result[0].prompt_code;
    } else {
      throw new AppError(`Fetched prompt code is null or undefined.`);
    }
  } catch (error) {
    loggerMySQL.error(`❌ Failed to fetch the prompt code.`);
    throw error;
  }
}
