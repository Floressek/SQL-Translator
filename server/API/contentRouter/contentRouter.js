import express from "express";
import { asyncWrapper } from "../../Utils/asyncWrapper.js";
import {
  dbSchema,
  promptExamples,
  promptCode,
} from "../../Utils/ResourceManager/resourceManager.js";

export const contentRouter = express.Router();

contentRouter.get(
  "/about",
  asyncWrapper(async (req, res) => {
    res.status(200).json({
      status: "success",
      data: {
        promptCode,
        dbSchema,
        promptExamples: promptExamples.promptForSQL_examples,
      },
    });
  })
);
