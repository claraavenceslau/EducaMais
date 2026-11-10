import jwt from "jsonwebtoken";
import { Role } from "../../generated/prisma/client";
import { AppError } from "./AppError";
import { getJwtSecret } from "./env";
import type { AuthPayload } from "./auth.types";

export function createAccessToken(payload: AuthPayload): string {
  return jwt.sign({ role: payload.role }, getJwtSecret(), {
    subject: payload.userId,
    expiresIn: "1d",
  });
}

export function verifyAccessToken(token: string): AuthPayload {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === "string" || !decoded.sub ||
      (decoded.role !== Role.STUDENT && decoded.role !== Role.TEACHER)) {
      throw new Error("Invalid token payload");
    }
    return { userId: decoded.sub, role: decoded.role };
  } catch {
    throw new AppError(401, "INVALID_TOKEN", "Token ausente, inválido ou expirado.");
  }
}
