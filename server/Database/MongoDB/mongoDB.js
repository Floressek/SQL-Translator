import { MongoClient } from "mongodb";
import { loggerMongoDB } from "../../Utils/logger.js";
import { AppError } from "../../Utils/AppError.js";
import { promptExamplesSchema } from "./mongoTypes.js";
import {
  promptForSQL_examples_schema,
  promptForCountingSQL_examples_schema,
  promptForLimitedSQL_examples_schema,
  promptForAnswer_examples_schema,
} from "../../OpenAI/responseSchemas.js";

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;
const MONGO_COLLECTION_EXAMPLES = process.env.MONGO_COLLECTION_EXAMPLES;
const MONGO_COLLECTION_SCHEMAS = process.env.MONGO_COLLECTION_SCHEMAS;
const MONGO_DATABASE = process.env.MONGO_DATABASE;
const DB_SCHEMA_VERSION = process.env.DB_SCHEMA_VERSION;

const mongoClient = new MongoClient(MONGO_CONNECTION_STRING);

async function retrieveDbSchema() {
  try {
    const db = mongoClient.db(MONGO_DATABASE);
    const coll = db.collection(MONGO_COLLECTION_SCHEMAS);

    const filter = {
      "schemaVersion.version": DB_SCHEMA_VERSION,
    };
    const options = {
      // Exclude _id and schemaVersion fields from the returned document
      projection: { _id: 0, schemaVersion: 0 },
    };
    const document = await coll.findOne(filter, options);

    if (!document) {
      throw new AppError("No db schema found in the database.");
    }

    loggerMongoDB.info(
      `📄 Retrieved a db schema. Schema version: ${DB_SCHEMA_VERSION}`
    );
    return document;
  } catch (error) {
    loggerMongoDB.error("❌ Failed to fetch the db schema.");
    throw error;
  }
}

async function retrievePromptExamples() {
  try {
    const db = mongoClient.db(MONGO_DATABASE);
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
      `📄 Retrieved a total of ${documents.length} prompt examples from collection: ${MONGO_COLLECTION_EXAMPLES}.`
    );
    return documents;
  } catch (error) {
    loggerMongoDB.error("❌ Failed to fetch the prompt examples.");
    throw error;
  }
}

export async function loadDbInformation() {
  const dbSchema = await retrieveDbSchema();
  const promptExamples = promptExamplesSchema.parse(
    await retrievePromptExamples()
  );
  mongoClient.close();
  loggerMongoDB.info("Successfully loaded database information! ✅");

  // Parse arrays of examples to be passed to LLM prompts
  const promptForSQL_examples = promptForSQL_examples_schema.parse(
    promptExamples.map((example) => ({
      userQuery: example.userQuery,
      aiAnswer: {
        isSelect: example.isSelect,
        sqlQuery: example.sqlQuery,
      },
    }))
  );

  const promptForCountingSQL_examples =
    promptForCountingSQL_examples_schema.parse(
      promptExamples
        .filter((example) => !!example.countingSqlQuery)
        .map((example) => ({
          employeeSQL: example.userQuery,
          aiAnswer: {
            countingSqlQuery: example.countingSqlQuery,
          },
        }))
    );

  const promptForLimitedSQL_examples =
    promptForLimitedSQL_examples_schema.parse(
      promptExamples
        .filter((example) => !!example.limitedSqlQuery)
        .map((example) => ({
          employeeSQL: example.userQuery,
          aiAnswer: {
            limitedSqlQuery: example.limitedSqlQuery,
          },
        }))
    );

  const promptForAnswer_examples = promptForAnswer_examples_schema.parse(
    promptExamples
      .filter((example) => !!example.formattedAnswer)
      .map((example) => ({
        userQuery: example.userQuery,
        aiAnswer: {
          formattedAnswer: example.formattedAnswer,
        },
      }))
  );

  return {
    dbSchema,
    promptExamples: {
      promptForSQL_examples,
      promptForCountingSQL_examples,
      promptForLimitedSQL_examples,
      promptForAnswer_examples,
    },
  };
}
