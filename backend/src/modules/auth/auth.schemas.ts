import { z } from "zod";

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const password = z.string().min(8).max(72).refine(
  (value) => new TextEncoder().encode(value).length <= 72,
  "A senha não pode exceder 72 bytes.",
);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email,
  password,
  role: z.enum(["aluno", "professor"]),
});

export const loginSchema = z.object({ email, password });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(256),
  password,
});

export type RegisterInput = z.infer<typeof registerSchema>;
