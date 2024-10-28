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

// used with prompt_for_countingSQL_and_limitedSQL()
export const countingSqlResponseSchema = z.object({
  countingSqlQuery: z.string(),
});

export const prompt_for_countingSQL_examples_schema = z
  .object({
    employeeSQL: z.string(),
    aiAnswer: countingSqlResponseSchema,
  })
  .array();

export const countingAndLimitedSqlResponseSchema =
  countingSqlResponseSchema.extend({
    limitedSqlQuery: z.string(),
    limitedSqlQueryFormatted: z.string(),
  });

export const prompt_for_countingSQL_and_limitedSQL_examples_schema = z
  .object({
    employeeSQL: z.string(),
    aiAnswer: countingAndLimitedSqlResponseSchema.extend({
      limitedSqlQueryFormatted:
        countingAndLimitedSqlResponseSchema.shape.limitedSqlQueryFormatted.optional(),
    }),
  })
  .array();

// used with promptForAnswer()
export const finalResponseSchema = z.object({
  formattedAnswer: z.string(),
});

export const promptForAnswer_examples_schema = z.object({
  userQuery: z.string(),
  aiAnswer: finalResponseSchema,
});
