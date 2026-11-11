import type { RequestHandler } from "express";
import type { Role } from "../../generated/prisma/client";
import { AppError } from "./AppError";

/**
 * Deve vir DEPOIS do requireAuth. Deixa passar só quem tem um dos papéis informados.
 * Exemplo: router.post("/", requireAuth, requireRole(Role.TEACHER), handler)
 */
export const requireRole = (...allowed: Role[]): RequestHandler => (req, _res, next) => {
  if (!req.auth) {
    return next(new AppError(401, "AUTHENTICATION_REQUIRED", "Informe um token Bearer válido."));
  }
  if (!allowed.includes(req.auth.role)) {
    return next(new AppError(403, "FORBIDDEN", "Você não tem permissão para acessar este recurso."));
  }
  next();
};