// // Utwórz plik: server/Database/tableSelector.js
// import sql from 'mssql';
// import {createLogger} from "../Utils/logger.js";
// import {fileURLToPath} from 'url';
//
// // Create the equivalent of __filename for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const logger = createLogger(__filename);
//
// // Lista priorytetowych tabel z Twojego diagramu
// const PRIORITY_TABLES = [
//     'kh_Kontrahent',
//     'kh_CmrZleceniaMirror',
//     'kh_RodzajKontaktu',
//     'kh_TypeEwidVAT',
//     'kh_Rabat',
//     'kh_CmrMirror',
//     'kh_GrupaRabatowa',
//     'kh_Vies',
//     'kh_WeryfikacjaNIP',
//     'kh_FormaPlatnosci',
//     'kh_Uzytkownik'
// ];
//
// /**
//  * Wybiera określone tabele z Gabonu do POC
//  */
// export async function selectSimpleTables() {
//     let connection;
//     try {
//         connection = await sql.connect(dbConfig);
//
//         // Sprawdź, które z naszych priorytetowych tabel faktycznie istnieją
//         const existingTables = [];
//         for (const tableName of PRIORITY_TABLES) {
//             try {
//                 const [result] = await connection.query(`
//           SELECT 1 FROM information_schema.tables
//           WHERE table_schema = ? AND table_name = ?
//         `, [process.env.MYSQL_DATABASE, tableName]);
//
//                 if (result.length > 0) {
//                     existingTables.push(tableName);
//                 }
//             } catch (error) {
//                 logger.warn(`Tabela ${tableName} nie istnieje lub nie jest dostępna`);
//             }
//         }
//
//         logger.info(`Znaleziono ${existingTables.length} priorytetowych tabel w bazie danych`);
//
//         // Pobierz informacje o kolumnach dla istniejących tabel
//         const tableSchemas = {};
//         for (const tableName of existingTables) {
//             const [columns] = await connection.query(`
//         SELECT
//           column_name,
//           data_type,
//           column_key,
//           is_nullable,
//           column_comment
//         FROM information_schema.columns
//         WHERE table_schema = ? AND table_name = ?
//         ORDER BY ordinal_position
//       `, [process.env.MYSQL_DATABASE, tableName]);
//
//             tableSchemas[tableName] = {
//                 columns: columns.map(c => ({
//                     name: c.column_name,
//                     type: c.data_type,
//                     isPrimaryKey: c.column_key === 'PRI',
//                     isForeignKey: c.column_key === 'MUL',
//                     isNullable: c.is_nullable === 'YES',
//                     comment: c.column_comment || ''
//                 }))
//             };
//         }
//
//         return {
//             selectedTables: existingTables,
//             tableSchemas
//         };
//     } catch (error) {
//         logger.error(`Błąd podczas wybierania tabel: ${error.message}`);
//         throw error;
//     } finally {
//         if (connection) {
//             await connection.end();
//         }
//     }
// }
//
// /**
//  * Buduje schemat bazy danych dla wybranych tabel
//  */
// export async function buildGabonSchema() {
//     try {
//         const { selectedTables, tableSchemas } = await selectSimpleTables();
//
//         // Pobierz przykładowe dane dla każdej tabeli
//         let connection;
//         try {
//             connection = await sql.connect(dbConfig);
//             for (const tableName of selectedTables) {
//                 try {
//                     const [sampleData] = await connection.query(`
//             SELECT * FROM ${tableName} LIMIT 3
//           `);
//
//                     tableSchemas[tableName].sampleData = sampleData;
//                 } catch (error) {
//                     logger.warn(`Nie udało się pobrać przykładowych danych dla tabeli ${tableName}: ${error.message}`);
//                     tableSchemas[tableName].sampleData = [];
//                 }
//             }
//         } finally {
//             if (connection) {
//                 await connection.end();
//             }
//         }
//
//         // Pobierz relacje między tymi tabelami
//         const relationships = [];
//
//         connection = await createConnection();
//         try {
//             for (const tableName of selectedTables) {
//                 const [fks] = await connection.query(`
//           SELECT
//             column_name,
//             referenced_table_name,
//             referenced_column_name
//           FROM information_schema.key_column_usage
//           WHERE table_schema = ?
//             AND table_name = ?
//             AND referenced_table_name IS NOT NULL
//         `, [process.env.MYSQL_DATABASE, tableName]);
//
//                 fks.forEach(fk => {
//                     // Uwzględnij tylko relacje między wybranymi tabelami
//                     if (selectedTables.includes(fk.referenced_table_name)) {
//                         relationships.push({
//                             fromTable: tableName,
//                             fromColumn: fk.column_name,
//                             toTable: fk.referenced_table_name,
//                             toColumn: fk.referenced_column_name
//                         });
//                     }
//                 });
//             }
//         } finally {
//             if (connection) {
//                 await connection.end();
//             }
//         }
//
//         // Sformatuj końcowy schemat
//         const schemaForOpenAI = {
//             tables: Object.entries(tableSchemas).map(([tableName, schema]) => ({
//                 name: tableName,
//                 columns: schema.columns,
//                 sampleData: schema.sampleData ? schema.sampleData.slice(0, 2) : [] // Uwzględnij tylko 2 przykładowe rekordy
//             })),
//             relationships
//         };
//
//         return schemaForOpenAI;
//     } catch (error) {
//         logger.error(`Błąd budowania schematu Gabon: ${error.message}`);
//         throw error;
//     }
// }