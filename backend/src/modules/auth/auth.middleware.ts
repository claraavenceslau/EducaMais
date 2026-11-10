import type { RequestHandler } from "express";
import { AppError } from "./AppError";
import { verifyAccessToken } from "./auth.tokens";

export const requireAuth: RequestHandler = (req, _res, next) => {
  const authorization = req.header("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) return next(new AppError(401, "AUTHENTICATION_REQUIRED", "Informe um token Bearer válido."));

  try {
    req.auth = verifyAccessToken(match[1]);
    next();
  } catch (error) {
    next(error);
  }
};
