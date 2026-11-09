import { AppError } from "./AppError";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new AppError(500, "SERVER_CONFIGURATION_ERROR", "JWT_SECRET precisa ter pelo menos 32 caracteres.");
  }
  return secret;
}

export function exposePasswordResetToken(): boolean {
  return process.env.NODE_ENV === "development" && process.env.EXPOSE_PASSWORD_RESET_TOKEN === "true";
}
