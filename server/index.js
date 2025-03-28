import "dotenv/config";
import express from "express";
import cors from "cors";
import {createLogger} from "./Utils/logger.js";
import {clientRouter} from "./API/clientRouter.js";
import {mainRouter} from "./API/mainRouter.js";
import {errorHandler} from "./Utils/Middleware/errorHandler.js";
import {fileURLToPath} from 'url';

// Create the equivalent of __filename for ES modules
const __filename = fileURLToPath(import.meta.url);

const logger = createLogger(__filename);

const {NODE_ENV} = process.env;
const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(express.json());

// Configure CORS with specific options
app.use(
    cors({
        origin: 'http://localhost:4200', // Your frontend origin running on port 52372
        credentials: true, // Enable credentials (cookies, authorization headers)
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.originalUrl}`);
    next();
});

// Routers
app.use(mainRouter);
app.use(clientRouter);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});