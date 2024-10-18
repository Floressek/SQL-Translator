import { MongoClient } from "mongodb";
import { loggerMongoDB } from "../Utils/logger.js";
import { AppError } from "../Utils/AppError.js";

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;
const MONGO_COLLECTION_EXAMPLES = process.env.MONGO_COLLECTION_EXAMPLES;
const MONGO_COLLECTION_SCHEMAS = process.env.MONGO_COLLECTION_SCHEMAS;

const mongoClient = new MongoClient(MONGO_CONNECTION_STRING);

async function retrieveDbSchema() {
  try {
    const db = mongoClient.db("budmat");
    const coll = db.collection(MONGO_COLLECTION_SCHEMAS);

    const filter = {
      schemaVersion: "withExampleDistinctValuesProperColumnDescriptions",
    };
    const options = {
      // Exclude _id and schemaVersion fields from the returned document
      projection: { _id: 0, schemaVersion: 0 },
    };
    const document = await coll.findOne(filter, options);

    if (!document) {
      throw new AppError("No db schema found in the database.");
    }

    loggerMongoDB.info(`📄 Retrieved a db schema.`);
    return document;
  } catch (error) {
    loggerMongoDB.error("❌ Failed to fetch the db schema.");
    throw error;
  }
}

async function retrievePromptExamples() {
  try {
    const db = mongoClient.db("budmat");
    const coll = db.collection(MONGO_COLLECTION_EXAMPLES);

    const options = {
      // Exclude _id field from the returned document
      projection: { _id: 0 },
    };

    const documents = await coll.find({}, options).toArray();

    if (documents.length === 0) {
      throw new AppError("No prompt examples found in the database.");
    }

    loggerMongoDB.info(
      `📄 Retrieved a total of ${documents.length} prompt examples.`
    );
    return documents;
  } catch (error) {
    loggerMongoDB.error("❌ Failed to fetch the prompt examples.");
    throw error;
  }
}

export async function loadDbInformation() {
  const dbInfo = {
    dbSchema: await retrieveDbSchema(),
    examplesForSQL: await retrievePromptExamples(),
  };

  mongoClient.close();
  loggerMongoDB.info("Successfully loaded database information! ✅");
  return dbInfo;
}
