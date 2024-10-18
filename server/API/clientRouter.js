import path from "path";
import express from "express";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const clientRouter = express.Router();
const clientPath = path.join(__dirname, "/client/browser");

//if we want all possible URLs to point to the main page we need to use both
//removing the first one completely breaks the app
//removing the second one doesn't load the page when using invalid url
clientRouter.use("/", express.static(clientPath));
clientRouter.use("*", express.static(clientPath));
