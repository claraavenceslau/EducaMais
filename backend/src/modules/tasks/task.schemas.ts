import { z } from "zod";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Informe uma data válida no formato AAAA-MM-DD.");

export const taskIdSchema = z.string().uuid();

export const taskInputSchema = z.object({
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().max(2000).optional().default(""),
  subject: z.string().trim().max(80).optional().default(""),
  dueDate: dateOnly,
  done: z.boolean().optional().default(false),
});

export type TaskInput = z.infer<typeof taskInputSchema>;
