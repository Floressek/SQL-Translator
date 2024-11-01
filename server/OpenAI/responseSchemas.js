import { z } from "zod";

// used with promptForSQL()
export const sqlResponseSchema = z.object({
  isSelect: z.boolean(),
  sqlQuery: z.string(),
  sqlQueryFormatted: z.string(),
});

export const promptForSQL_examples_schema = z
  .object({
    userQuery: z.string(),
    aiAnswer: sqlResponseSchema.extend({
      sqlQueryFormatted: sqlResponseSchema.shape.sqlQueryFormatted.optional(),
    }),
  })
  .array();

// used with promptForCountingSQL()
export const countingSqlResponseSchema = z.object({
  expectedRowCount: z.number().optional(),
  countingSqlQuery: z.string(),
});

export const promptForCountingSQL_examples_schema = z
  .object({
    employeeSQL: z.string(),
    aiAnswer: countingSqlResponseSchema,
  })
  .array();

// used with promptForLimitedSQL()
export const limitedSqlResponseSchema = z.object({
  limitedSqlQuery: z.string(),
  limitedSqlQueryFormatted: z.string(),
});

export const promptForLimitedSQL_examples_schema = z
  .object({
    employeeSQL: z.string(),
    aiAnswer: limitedSqlResponseSchema.extend({
      limitedSqlQueryFormatted:
        limitedSqlResponseSchema.shape.limitedSqlQueryFormatted.optional(),
    }),
  })
  .array();

// used with promptForAnswer()
export const finalResponseSchema = z.object({
  formattedAnswer: z.string(),
});

export const promptForAnswer_examples_schema = z
  .object({
    userQuery: z.string(),
    aiAnswer: finalResponseSchema,
  })
  .array();
