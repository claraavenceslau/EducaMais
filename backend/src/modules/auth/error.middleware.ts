import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "./AppError";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    const fields = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Dados inválidos.", fields } });
    return;
  }
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
    return;
  }
  console.error("Erro não tratado na API:", error);
  res.status(500).json({ error: { code: "INTERNAL_SERVER_ERROR", message: "Ocorreu um erro interno." } });
};
