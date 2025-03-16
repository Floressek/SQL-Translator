import {createLogger} from "../logger.js";
import { fileURLToPath } from 'url';

// Create the equivalent of __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const logger = createLogger(__filename);

export function errorHandler(err, req, res, next) {
  logger.error(
    "error",
    JSON.stringify(
      {
        "ERR.NAME": err.name,
        "ERR.MESSAGE": err.message,
        "ERR.STACK": err.stack,
        "APP.ALIVE": true
      },
      null,
      4
    ),
    `/${req.path.split("/").at(-1)}`
  );

  res.status(500).json({
    status: "error",
    errorCode: "INTERNAL_SERVER_ERR",
  });
}
