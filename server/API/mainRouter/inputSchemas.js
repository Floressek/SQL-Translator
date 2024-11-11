import { z } from "zod";
import {
  MAX_ROWS_ALLOWED,
  MAX_QUERY_LENGTH,
} from "../../Constants/constants.js";

export const querySchema = z.object({
  query: z.string().min(1).max(MAX_QUERY_LENGTH),
  rowLimit: z.number().min(1).max(MAX_ROWS_ALLOWED),
});