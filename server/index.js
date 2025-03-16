import "dotenv/config";
import express from "express";
import cors from "cors";
import {loggerMain} from "./Utils/logger.js";
import {clientRouter} from "./API/clientRouter.js";
import {mainRouter} from "./API/mainRouter.js";
import {errorHandler} from "./Utils/Middleware/errorHandler.js";
import cookieParser from "cookie-parser";

const {NODE_ENV} = process.env;
const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(express.json());
//  Access-Control-Allow-Credentials: true & Access-Control-Allow-Origin: XXX headers need to be configured in order for a browser to send cookies to the server in cross-origin context
app.use(
    cors()
);

// Routers
app.use(mainRouter);
app.use(clientRouter);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
    loggerMain.info(`Server is running on port ${PORT}`);
});
