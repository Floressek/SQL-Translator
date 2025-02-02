import "dotenv/config";
import express from "express";
import cors from "cors";
import { loggerMain } from "./Utils/logger.js";
import { clientRouter } from "./API/clientRouter.js";
import { authRouter } from "./API/authorizationRouter/authorizationRouter.js";
import { contentRouter } from "./API/contentRouter/contentRouter.js";
import { mainRouter } from "./API/mainRouter/mainRouter.js";
import { errorHandler } from "./Utils/Middleware/errorHandler.js";
import cookieParser from "cookie-parser";

const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
//  Access-Control-Allow-Credentials: true & Access-Control-Allow-Origin: XXX headers need to be configured in order for a browser to send cookies to the server in cross-origin context
app.use(
  cors({
    origin:
      NODE_ENV === "production"
        ? "https://sql-translator-production-92ae.up.railway.app"
        : "http://localhost:4200",
    credentials: true,
  })
);

// Routers
app.use("/auth", authRouter);
app.use(mainRouter);
app.use(contentRouter);
app.use(clientRouter);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  loggerMain.info(`Server is running on port ${PORT}`);
});
