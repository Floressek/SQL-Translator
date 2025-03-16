import winston from "winston";

// Custom log format
const customFormat = winston.format.printf(
    ({level, message, label, timestamp}) => {
        return `${timestamp} - [${label}] - [${level.toUpperCase()}] - ${message}`;
    }
);

function createLogger(level, label) {
    return winston.createLogger({
        level: level,
        format: winston.format.combine(
            winston.format.label({label: label}),
            winston.format.timestamp({format: "YYYY-MM-DD HH:mm:ss,SSS"}),
            customFormat
        ),
        transports: [new winston.transports.Console()],
    });
}

// Default loggers
export const loggerMain = createLogger("info", "main");
export const loggerAuth = createLogger("info", "auth");
export const loggerMySQL = createLogger("info", "mysql");
export const loggerMongoDB = createLogger("info", "mongodb");
export const loggerOpenAI = createLogger("info", "openai");

// Endpoint loggers
export const loggerLanguageToSQL = createLogger("info", "/language-to-sql");

// Error logger with custom logging method that accepts a label
export const loggerError = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({format: "YYYY-MM-DD HH:mm:ss,SSS"}),
        customFormat
    ),
    transports: [new winston.transports.Console()],
});
loggerError.logWithLabel = function (level, message, label) {
    const logEntry = {
        level,
        message,
        label,
        timestamp: new Date().toISOString(),
    };
    this.log(logEntry);
};