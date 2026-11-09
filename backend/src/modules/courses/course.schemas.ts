import { z } from "zod";

const themes = ["Design", "Mobile", "Programação", "Dados", "Gestão"] as const;
const levels = ["Iniciante", "Intermediário", "Avançado"] as const;

const lessonSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(120),
  minutes: z.number().int().min(1).max(600),
});

export const courseIdSchema = z.string().uuid();

export const courseInputSchema = z.object({
  title: z.string().trim().min(1).max(60),
  description: z.string().trim().max(3000).default(""),
  theme: z.enum(themes),
  level: z.enum(levels),
  status: z.enum(["publicado", "rascunho"]),
  lessons: z.array(lessonSchema).max(100).default([]),
}).superRefine((course, context) => {
  if (course.status === "publicado" && course.lessons.length === 0) {
    context.addIssue({ code: "custom", path: ["lessons"], message: "Adicione ao menos uma aula antes de publicar." });
  }
});

export type CourseInput = z.infer<typeof courseInputSchema>;
