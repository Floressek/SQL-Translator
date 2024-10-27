import { loggerError } from "../logger.js";
import { ERR_CODES } from "../../Constants/StatusCodes/errorCodes.js";
import { ZodError } from "zod";

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    loggerError.logWithLabel(
      "warn",
      "Invalid request parameter(s):",
      `/${req.path.split("/").at(-1)}`
    );
    console.log(`${err.name}: ${err.message}`);
    console.log(`\n"APP.ALIVE": true `);

    const firstIssue = err.issues[0]; // Only handle the first issue
    const paramName = firstIssue.path.join("."); // Path of the parameter that caused the error

    let errorMessage;
    let errorCode;
    // Check if the error is due to a missing or invalid parameter
    if (
      firstIssue.code === "invalid_type" &&
      firstIssue.received === "undefined"
    ) {
      errorMessage = `Missing parameter: [${paramName}]`;
      errorCode = ERR_CODES.MISSING_PARAM_ERR;
    } else {
      errorMessage = `Invalid parameter: [${paramName}]. ${firstIssue.message}`;
      errorCode = ERR_CODES.INVALID_PARAM_ERR;
    }

    res.status(400).json({
      status: "error",
      errorCode: errorCode,
      errorDetails: {
        message: errorMessage,
      },
    });
  } else {
    loggerError.logWithLabel(
      "error",
      JSON.stringify(
        {
          "ERR.NAME": err.name,
          "ERR.MESSAGE": err.message,
          "ERR.STACK": err.stack,
          "APP.ALIVE": true,
        },
        null,
        4
      ),
      `/${req.path.split("/").at(-1)}`
    );

    res.status(500).json({
      status: "error",
      errorCode: ERR_CODES.INTERNAL_SERVER_ERR,
    });
  }
}
