import { z } from "zod";
import {
  sqlResponseSchema,
  finalResponseSchema,
} from "../../OpenAI/LLMschemas.js";

export const promptExamplesSchema = sqlResponseSchema
  .extend({
    userQuery: z.string(),
    sqlQueryFormatted: sqlResponseSchema.shape.sqlQueryFormatted.optional(),
    sqlQueryLimited: z.string().optional(),
    sqlQueryLimitedFormatted: z.string().optional(),
    rowData: z.any().array().optional(),
    formattedAnswer: finalResponseSchema.shape.formattedAnswer.optional(),
  })
  .array();

// {
//     userQuery: string,
//     isSelect: boolean,
//     sqlQuery: string,
//     sqlQueryLimited?: string | undefined;
//     sqlQueryFormatted?: string | undefined,
//     sqlQueryLimitedFormatted?: string | undefined;
//     rowData?: any[] | undefined,
//     formattedAnswer?: string | undefined
// } []