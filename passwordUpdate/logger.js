import winston from "winston";

// Custom log format
const customFormat = winston.format.printf(
  ({ level, message, label, timestamp }) => {
    return `${timestamp} - [${label}] - [${level.toUpperCase()}] - ${message}`;
  }
);

function createLogger(level, label) {
  const logger = winston.createLogger({
    level: level,
    format: winston.format.combine(
      winston.format.label({ label: label }),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss,SSS" }),
      customFormat
    ),
    transports: [new winston.transports.Console()],
  });

  return logger;
}

export const loggerMain = createLogger("info", "main");
export const loggerMySQL = createLogger("info", "mysql");