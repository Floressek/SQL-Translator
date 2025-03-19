import {createConnection} from "mysql";
// Logging module
import {createLogger} from "../Utils/logger.js";
import { fileURLToPath } from 'url';

// Create the equivalent of __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const logger = createLogger(__filename);

// Our selected tables for POC
const PRIORITY_TABLES = [
    'kh_Kontrahent',
    'kh_CmrZleceniaMirror',
    'kh_RodzajKontaktu',
    'kh_TypeEwidVAT',
    'kh_Rabat',
    'kh_CmrMirror',
    'kh_GrupaRabatowa',
    'kh_Vies',
    'kh_WeryfikacjaNIP',
    'kh_FormaPlatnosci',
    'kh_Uzytkownik'
]

export async function selectSimpleTables() {
    let connection;
    try {
        connection = await createConnection();

        // Check if any of our selected tables actually exist
        const existingTables = [];
        for (const tableName of PRIORITY_TABLES) {
            try {
                const [result] = await connection.query(`
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = ? AND table_name = ?
                `, [process.env.MYSQL_DATABASE, tableName]);

                if (result.length > 0) {
                    existingTables.push(tableName);
                }
            } catch (error) {
                logger.warn(`Table ${tableName} doesn't exist or can't be accessed`);
            }
        }

        logger.info(`Found ${existingTables.length} priority tables in the database`);
    }
}