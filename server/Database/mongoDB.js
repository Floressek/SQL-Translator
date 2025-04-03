import {MongoClient} from "mongodb";
import {AppError} from "../Utils/AppError.js";
import {createLogger} from "../Utils/logger.js";
import {fileURLToPath} from 'url';

// Create the equivalent of __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const logger = createLogger(__filename);

const MONGO_DATABASE = process.env.MONGO_DATABASE;
const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;
const MONGO_COLLECTION_EXAMPLES = process.env.MONGO_COLLECTION_EXAMPLES;
const MONGO_COLLECTION_SCHEMAS = process.env.MONGO_COLLECTION_SCHEMAS;
const mongoClient = new MongoClient(MONGO_CONNECTION_STRING);

async function retrieveDbSchema() {
    try {
        const db = mongoClient.db(MONGO_DATABASE || "gabon_db");
        const coll = db.collection(MONGO_COLLECTION_SCHEMAS);

        // Try to get both schemas
        const tableSchema = await coll.findOne(
            {schemaVersion: "gabon_customer_tables"},
            {projection: {_id: 0}}
        );

        const viewSchema = await coll.findOne(
            {schemaVersion: "gabon_view_tables"},
            {}
        );

        let combinedSchema = {
            tables: [],
            relationships: [],
        };

        if (tableSchema) {
            combinedSchema.tables = [...combinedSchema.tables, ...tableSchema.tables];
            combinedSchema.relationships = [...combinedSchema.relationships, ...tableSchema.relationships];
            logger.info(`📄 Added table schema with version: ${tableSchema.schemaVersion}`);
        }

        if (viewSchema) {
            combinedSchema.tables = [...combinedSchema.tables, ...viewSchema.tables];
            combinedSchema.relationships = [...combinedSchema.relationships, ...viewSchema.relationships];
            logger.info(`📄 Added view schema with version: ${viewSchema.schemaVersion}`);
        }

        if (!tableSchema && !viewSchema) {
            throw new AppError("No schemas found in the database.");
        }

        logger.info(`📄 Retrieved and combined schemas.`);
        return combinedSchema;
    } catch (error) {
        logger.error("❌ Failed to fetch the db schema.");
        throw error;
    }
}

async function retrievePromptExamples() {
    try {
        const db = mongoClient.db(MONGO_DATABASE || "gabon_db");
        const coll = db.collection(MONGO_COLLECTION_EXAMPLES);

        const options = {
            // Exclude _id field from the returned document
            projection: {_id: 0},
        };

        const documents = await coll.find({}, options).toArray();

        if (documents.length === 0) {
            throw new AppError("No prompt examples found in the database.");
        }

        logger.info(
            `📄 Retrieved a total of ${documents.length} prompt examples.`
        );
        return documents;
    } catch (error) {
        logger.error("❌ Failed to fetch the prompt examples.");
        throw error;
    }
}

export async function loadDbInformation() {
    const dbInfo = {
        dbSchema: await retrieveDbSchema(),
        examplesForSQL: await retrievePromptExamples(),
    };

    await mongoClient.close();
    logger.info("Successfully loaded database information! ✅");
    return dbInfo;
}
