import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { Role } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "./AppError";
import { authRepository } from "./auth.repository.prisma";
import { createAccessToken } from "./auth.tokens";
import { exposePasswordResetToken } from "./env";
import { toPublicUser } from "./auth.types";
import type { RegisterInput } from "./auth.schemas";

const passwordCost = 12;
const resetTokenLifetimeMs = 60 * 60 * 1000;

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export const authService = {
  async register(input: RegisterInput) {
    if (await authRepository.findUserByEmail(input.email)) {
      throw new AppError(409, "EMAIL_ALREADY_REGISTERED", "Este e-mail já está cadastrado.");
    }

    const password = await bcrypt.hash(input.password, passwordCost);
    try {
      const user = await authRepository.createUser({
        name: input.name,
        email: input.email,
        password,
        role: input.role === "aluno" ? Role.STUDENT : Role.TEACHER,
      });
      return { user: toPublicUser(user), token: createAccessToken({ userId: user.id, role: user.role }) };
    } catch (error) {
      // The unique constraint also handles two simultaneous registrations for the same address.
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
        throw new AppError(409, "EMAIL_ALREADY_REGISTERED", "Este e-mail já está cadastrado.");
      }
      throw error;
    }
  },

  async login(email: string, password: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError(401, "INVALID_CREDENTIALS", "E-mail ou senha incorretos.");
    }
    return { user: toPublicUser(user), token: createAccessToken({ userId: user.id, role: user.role }) };
  },

  async currentUser(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new AppError(401, "INVALID_SESSION", "Esta sessão não é mais válida.");
    return toPublicUser(user);
  },

  async requestPasswordReset(email: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) return { resetToken: undefined };

    const resetToken = randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(resetToken);
    const expiresAt = new Date(Date.now() + resetTokenLifetimeMs);

    await prisma.$transaction([
      prisma.passwordReset.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
      prisma.passwordReset.create({ data: { userId: user.id, tokenHash, expiresAt } }),
    ]);

    // Email delivery is not configured yet. This guarded path is for local development only.
    return { resetToken: exposePasswordResetToken() ? resetToken : undefined };
  },

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = hashResetToken(token);
    const password = await bcrypt.hash(newPassword, passwordCost);

    await prisma.$transaction(async (tx) => {
      const reset = await tx.passwordReset.findFirst({
        where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
      });
      if (!reset) throw new AppError(400, "INVALID_RESET_TOKEN", "Token de recuperação inválido ou expirado.");

      const claimed = await tx.passwordReset.updateMany({
        where: { id: reset.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });
      if (claimed.count !== 1) {
        throw new AppError(400, "INVALID_RESET_TOKEN", "Token de recuperação inválido ou expirado.");
      }

      await tx.user.update({ where: { id: reset.userId }, data: { password } });
      await tx.passwordReset.updateMany({
        where: { userId: reset.userId, usedAt: null },
        data: { usedAt: new Date() },
      });
    });
  },
};
