import mysql from "mysql2/promise";
import { loggerMySQL } from "../logger.js";

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
    loggerMySQL.error(error);
    if (connection) {
      await connection.end();
    }
  }
}

export async function createTestConnection() {
  const connection = await createConnection();

  if (connection) {
    await connection.end();
    loggerMySQL.info("Successfully established a database connection! ✅");
  }
}

export async function insertPassword(hashedPassword) {
  const connection = await createConnection();
  if (connection) {
    try {
      const query = `UPDATE secrets SET password_hash = ? WHERE id = 1`;
      const values = [hashedPassword];
      const [result, fileds] = await connection.execute(query, values);
      if (result.affectedRows > 0) {
        loggerMySQL.info(`Successfully updated the password! ✅`);
      } else {
        loggerMySQL.warn(`❗Count of affected rows is 0. Password wasn't updated correctly.`);
      }
    } catch (error) {
      loggerMySQL.error(error);
    } finally {
      connection.end()
    }
  }
}

await createTestConnection();
