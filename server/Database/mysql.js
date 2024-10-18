import mysql from "mysql2/promise";
import { loggerMySQL } from "../Utils/logger.js";
import { AppError } from "../Utils/AppError.js";

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
};

export async function createConnection() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    loggerMySQL.error("❌ Error creating a connection.");
    if (connection) {
      await connection.end();
    }
    throw error;
  }
}

export async function createTestConnection() {
  let connection;
  try {
    connection = await createConnection();
  } catch {
  } finally {
    if (connection) {
      await connection.end();
      loggerMySQL.info("Successfully established a database connection! ✅");
    }
  }
}

export async function executeSQL(query) {
  let connection;
  try {
    connection = await createConnection();
    const [rows] = await connection.execute(query);
    loggerMySQL.info("Successfully fetched the raw data! ✅");
    loggerMySQL.info(`Number of rows fetched: ${rows.length}`);
    return rows;
  } catch (error) {
    loggerMySQL.error("❌ Error execucting SQL.");
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function fetchPassword() {
  const query = `SELECT password_hash FROM secrets WHERE id = 1`;
  try {
    const result = await executeSQL(query);
    if (result && result.length > 0 && result[0].password_hash) {
      loggerMySQL.info(`Password hash fetched from the db.`);
      return result[0].password_hash;
    } else {
      throw new AppError(`Fetched password is null or undefined.`);
    }
  } catch (error) {
    loggerMySQL.error(`❌ Failed to fetch the password.`);
    throw error;
  }
}

await createTestConnection();
