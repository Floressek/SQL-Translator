import { z } from "zod";

export const passwordSchema = z.object({
  password: z.string().min(1).max(500),
});
