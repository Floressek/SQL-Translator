import { z } from "zod";
import {
  sqlResponseSchema,
  countingSqlResponseSchema,
  countingAndLimitedSqlResponseSchema,
  finalResponseSchema,
} from "../../OpenAI/responseSchemas.js";

export const promptExamplesSchema = sqlResponseSchema
  .extend({
    sqlQueryFormatted: sqlResponseSchema.shape.sqlQueryFormatted.optional(),
  })
  .merge(
    countingAndLimitedSqlResponseSchema.extend({
      countingSqlQuery:
        countingSqlResponseSchema.shape.countingSqlQuery.optional(),
      limitedSqlQuery:
        countingAndLimitedSqlResponseSchema.shape.limitedSqlQuery.optional(),
      limitedSqlQueryFormatted:
        countingAndLimitedSqlResponseSchema.shape.limitedSqlQueryFormatted.optional(),
    })
  )
  .merge(
    finalResponseSchema.extend({
      formattedAnswer: finalResponseSchema.shape.formattedAnswer.optional(),
    })
  )
  .extend({
    userQuery: z.string(),
  }).array();

// {
//     isSelect: boolean,
//     sqlQuery: string,
//     userQuery: string,
//     sqlQueryFormatted?: string | undefined,
//     countingSqlQuery?: string | undefined,
//     limitedSqlQuery?: string | undefined,
//     limitedSqlQueryFormatted?: string | undefined,
//     formattedAnswer?: string | undefined
// } []