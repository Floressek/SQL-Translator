import {createLogger} from "../logger.js";
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
