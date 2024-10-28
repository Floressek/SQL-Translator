import { z } from "zod";
import {
  sqlResponseSchema,
  countingSqlResponseSchema,
  limitedSqlResponseSchema,
  finalResponseSchema,
} from "../../OpenAI/responseSchemas.js";

export const promptExamplesSchema = sqlResponseSchema
  .extend({
    sqlQueryFormatted: sqlResponseSchema.shape.sqlQueryFormatted.optional(),
  })
  .merge(
    countingSqlResponseSchema.extend({
      countingSqlQuery:
        countingSqlResponseSchema.shape.countingSqlQuery.optional(),
    })
  )
  .merge(
    limitedSqlResponseSchema.extend({
      limitedSqlQuery:
        limitedSqlResponseSchema.shape.limitedSqlQuery.optional(),
      limitedSqlQueryFormatted:
        limitedSqlResponseSchema.shape.limitedSqlQueryFormatted.optional(),
    })
  )
  .merge(
    finalResponseSchema.extend({
      formattedAnswer: finalResponseSchema.shape.formattedAnswer.optional(),
    })
  )
  .extend({
    userQuery: z.string(),
  })
  .array();

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