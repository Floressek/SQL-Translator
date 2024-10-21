import "dotenv/config";
import bcrypt from "bcrypt";
import { loggerMain } from "./logger.js";
import { insertPassword } from "./Database/mysql.js";

const PLAIN_TEXT_PASSWORD = process.env.PLAIN_TEXT_PASSWORD;
loggerMain.info(`Plain text password: ${PLAIN_TEXT_PASSWORD}`);


// Hash password
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(PLAIN_TEXT_PASSWORD, saltRounds);
loggerMain.info(`Hashed password: ${hashedPassword}`);


// Insert new password into MySQL db
await insertPassword(hashedPassword)


// Compate passwords (you can repeat the password provided in .env under testPassword to check if password comparison works as expected)
const testPassword = "test test test";
const areMatching = await bcrypt.compare(testPassword, hashedPassword);
loggerMain.info(`Do passwords match: ${areMatching}`);
