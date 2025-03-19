import {createLogger} from "../logger.js";
import { fileURLToPath } from 'url';

// Create the equivalent of __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const logger = createLogger(__filename);

export function errorHandler(err, req, res, next) {
    // Extract the endpoint name from the path
    const endpoint = `/${req.path.split("/").at(-1)}`;

    // Create error details object
    const errorDetails = {
        "ERR.NAME": err.name,
        "ERR.MESSAGE": err.message,
        "ERR.STACK": err.stack,
        "APP.ALIVE": true
    };

    // Use the logWithLabel method to maintain compatibility with the old approach
    logger.logWithLabel(
        "error",
        JSON.stringify(errorDetails, null, 4),
        endpoint
    );

    res.status(500).json({
        status: "error",
        errorCode: "INTERNAL_SERVER_ERR",
    });
}