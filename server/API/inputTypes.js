import { z } from "zod";
import { MAX_ROWS_ALLOWED, MAX_QUERY_LENGTH } from "../Constants/constants.js";

export const querySchema = z.object({
  userQuery: z.string().min(1).max(MAX_QUERY_LENGTH),
  limitStrategy: z
    .object({
      maxRows: z.number().int().positive().lte(MAX_ROWS_ALLOWED),
      forceLimit: z.boolean().optional(),
    })
    .optional(),
  cacheStrategy: z
    .object({
      cacheFailed: z.boolean(),
      useCached: z.boolean().optional(),
    })
    .optional(),
});

export const passwordSchema = z.object({
  password: z.string().min(1).max(500),
});
