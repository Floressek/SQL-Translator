import sql from 'mssql';
import {createLogger} from "../Utils/logger.js";
import {fileURLToPath} from 'url';

// Create the equivalent of __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const logger = createLogger(__filename);

const dbConfig = {
    server: process.env.MSSQL_SERVER || 'localhost',
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    database: process.env.MSSQL_DATABASE,
    port: parseInt(process.env.MSSQL_PORT) || 1433,
    options: {
        encrypt: false, // Use encryption
        trustServerCertificate: true, // Trust the server certificate
    }
};

export async function createConnection() {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        return connection;
    } catch (error) {
        logger.error(dbConfig);
        logger.error("❌ Error creating a connection.");
        if (connection) {
            await connection.end();
        }
        throw error;
    }
}

export async function createTestConnection() {
    try {
        const pool = await createConnection();
        if (pool) {
            await pool.close();
            logger.info("Successfully established a database connection! ✅");
        }
    } catch (error) {
        logger.error("Failed to create test connection", error);
    }
}


export async function executeSQL(query) {
    let pool;
    try {
        pool = await createConnection();
        const result = await pool.request().query(query);
        logger.info("Successfully executed the SQL query! ✅");

        // Check if this is a SELECT query
        if (result.recordset) {
            logger.info(`Number of rows fetched: ${result.recordset.length}`);
            return result.recordset;
        }
        // For INSERT, UPDATE, DELETE operations
        else if (result.rowsAffected) {
            logger.info(`Number of rows affected: ${result.rowsAffected[0]}`);
            return { rowsAffected: result.rowsAffected[0] };
        }
        // For other cases
        return result;
    } catch (error) {
        logger.error("❌ Error executing SQL:", error);
        throw error;
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}



await createTestConnection();
