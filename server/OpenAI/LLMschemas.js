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

// used with promptForAnswer()
export const finalResponseSchema = z.object({
  formattedAnswer: z.string(),
});

export const promptForAnswer_examples_schema = z
  .object({
    inputData: z.object({
      userQuery: z.string(),
      sqlTranslation: z.string(),
      rowData: z.any().array(),
    }),
    aiAnswer: z.string(),
  })
  .array();
