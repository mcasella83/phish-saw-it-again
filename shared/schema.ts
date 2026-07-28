import { z } from "zod";

export const userSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
});

export type User = z.infer<typeof userSchema>;