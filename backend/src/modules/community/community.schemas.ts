import { z } from "zod";

export const discussionIdSchema = z.string().uuid();
export const discussionInputSchema = z.object({
  title: z.string().trim().min(5).max(100),
  body: z.string().trim().min(1).max(5000),
  subject: z.string().trim().max(24).default("Geral"),
});
export const replyInputSchema = z.object({ body: z.string().trim().min(1).max(2000) });
