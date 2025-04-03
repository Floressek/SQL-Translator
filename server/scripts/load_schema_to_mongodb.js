import {MongoClient} from 'mongodb';
import fs from 'fs';
import path from 'path';
import {createLogger} from "../Utils/logger.js";
import {fileURLToPath} from 'url';
import * as dotenv from "dotenv";

dotenv.config();

// Create the equivalent of __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logger = createLogger(__filename);

async function loadDataToMongoDB() {
    const uri = process.env.MONGO_CONNECTION_STRING || "mongodb://SA:Password123!@localhost:27017";
    const client = new MongoClient(uri);

    // Determine which schema to load (default to money schema)
    const schemaFile = process.env.SCHEMA_FILE || 'gabon_schema_money.json';
    // Allow overriding schema version
    const schemaVersion = process.env.SCHEMA_VERSION || "gabon_view_tables";

    logger.info(`Loading schema from file: ${schemaFile} with version: ${schemaVersion}`);

    if (!uri) {
        logger.error("❌ MONGO_CONNECTION_STRING is not set.");
    }

    if (!client) {
        logger.error("❌ MongoDB client is not initialized.");
    }

    try {
        await client.connect();
        logger.info("✅ Connected to MongoDB");
        const db = client.db(process.env.MONGO_DATABASE || "gabon_db");
        const collection = db.collection(process.env.MONGO_COLLECTION_SCHEMAS || "schema");
        const examplesCollection = db.collection("examples");

        // Load the schema from the same folder as the script
        const schemaPath = path.join(__dirname, process.env.SCHEMA_FILE);
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');
        const schemaData = JSON.parse(schemaContent);

        // Override schema version if needed
        if (schemaVersion) {
            schemaData.schemaVersion = schemaVersion;
        }

        // Load the prompt examples from the same folder as the script
        const examplesPath = path.join(__dirname, process.env.EXAMPLES_FILE || 'gabon_examples.json');
        const examplesContent = fs.readFileSync(examplesPath, 'utf8');
        const examplesData = JSON.parse(examplesContent);


        // Insert the schema and examples into MongoDB
        const existingSchema = await collection.findOne({schemaVersion: schemaData.schemaVersion});
        if (existingSchema) {
            logger.info(`Schema with version ${schemaData.schemaVersion} already exists in MongoDB. Updating...`);
            await collection.replaceOne({schemaVersion: schemaData.schemaVersion}, schemaData);
            logger.info(`📄 Schema updated in MongoDB.`);
        } else {
            logger.info(`Schema with version ${schemaData.schemaVersion} does not exist in MongoDB. Inserting...`);
            const result = await collection.insertOne(schemaData);
            logger.info(`📄 Schema loaded to MongoDB with ID: ${result.insertedId}`);
        }

        // Delete existing examples
        await examplesCollection.deleteMany({});

        // Delete the _id field from each example
        const examplesWithoutIds = examplesData.map(({_id, ...rest}) => rest);

        // Insert the examples into MongoDB
        if (examplesWithoutIds.length > 0) {
            const result = await examplesCollection.insertMany(examplesWithoutIds);
            logger.info(`📄 ${result.insertedCount} prompt examples loaded to MongoDB`);
        } else {
            logger.info("No prompt examples to load to MongoDB.");
        }
    } catch (error) {
        logger.error("❌ Error loading schema to MongoDB:", error);
        console.log("❌ Error loading schema to MongoDB:", error);
    } finally {
        await client.close();
        logger.info("✅ MongoDB connection closed");
    }
}

loadDataToMongoDB().catch(console.error);