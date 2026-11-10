import { prisma } from "./prisma";
import { PointSource, Role } from "../generated/prisma/client";

export type PointsResult = { awarded: boolean; points: number; totalPoints: number };

/**
Conclui uma aula: registra o progresso, grava o extrato e soma ao total do usuário.
Tudo na mesma transação: se qualquer passo falhar, nada é salvo.
 */

export async function completeLesson(userId: string, lessonId: string): Promise<PointsResult> {
  return prisma.$transaction(async (tx) => {
    const lesson = await tx.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new Error("LESSON_NOT_FOUND");

    const enrolled = await tx.enrollment.findUnique({
      where: { userId_subjectId: { userId, subjectId: lesson.subjectId } },
    });
    if (!enrolled) throw new Error("NOT_ENROLLED");

    const done = await tx.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    if (done) {
      const u = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { totalPoints: true } });
      return { awarded: false, points: 0, totalPoints: u.totalPoints };
    }

    await tx.lessonProgress.create({ data: { userId, lessonId } });
    await tx.pointTransaction.create({
      data: { userId, points: lesson.points, source: PointSource.LESSON, lessonId },
    });
    const u = await tx.user.update({
      where: { id: userId },
      data: { totalPoints: { increment: lesson.points } },
      select: { totalPoints: true },
    });
    return { awarded: true, points: lesson.points, totalPoints: u.totalPoints };
  });
}

/** Conclui um desafio, com a mesma lógica da aula. */
export async function completeChallenge(userId: string, challengeId: string): Promise<PointsResult> {
  return prisma.$transaction(async (tx) => {
    const challenge = await tx.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) throw new Error("CHALLENGE_NOT_FOUND");

    if (challenge.subjectId) {
      const enrolled = await tx.enrollment.findUnique({
        where: { userId_subjectId: { userId, subjectId: challenge.subjectId } },
      });
      if (!enrolled) throw new Error("NOT_ENROLLED");
    }

    const done = await tx.challengeCompletion.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
    });
    if (done) {
      const u = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { totalPoints: true } });
      return { awarded: false, points: 0, totalPoints: u.totalPoints };
    }

    await tx.challengeCompletion.create({ data: { userId, challengeId } });
    await tx.pointTransaction.create({
      data: { userId, points: challenge.points, source: PointSource.CHALLENGE, challengeId },
    });
    const u = await tx.user.update({
      where: { id: userId },
      data: { totalPoints: { increment: challenge.points } },
      select: { totalPoints: true },
    });
    return { awarded: true, points: challenge.points, totalPoints: u.totalPoints };
  });
}

/** Ranking dos alunos por pontos (desempate: quem entrou primeiro). */
export async function getRanking(limit = 10) {
  return prisma.user.findMany({
    where: { role: Role.STUDENT },
    orderBy: [{ totalPoints: "desc" }, { createdAt: "asc" }],
    take: limit,
    select: { id: true, name: true, avatarUrl: true, totalPoints: true },
  });
}