// Resource manager is meant to fetch the necessary data on the app initialization
// Fetched data will then be used by the app throughout its whole lifetime
import "dotenv/config";
import { loadDbInformation } from "../../Database/MongoDB/mongoDB.js";
import { getPromptCode } from "./resourceManagerUtils.js";

export const { dbSchema, promptExamples } = await loadDbInformation();

export const promptCode = await getPromptCode();
