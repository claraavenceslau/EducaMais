import { prisma } from "./lib/prisma";
import { completeLesson, completeChallenge, getRanking } from "./lib/points";

async function main() {
  const ana = await prisma.user.findUniqueOrThrow({ where: { email: "aluna@educamais.test" } });
  const bruno = await prisma.user.findUniqueOrThrow({ where: { email: "aluno@educamais.test" } });

  // 1. Concluir uma aula que a Ana ainda não fez
  const done = await prisma.lessonProgress.findMany({ where: { userId: ana.id }, select: { lessonId: true } });
  const next = await prisma.lesson.findFirst({
    where: { id: { notIn: done.map((d) => d.lessonId) }, subject: { enrollments: { some: { userId: ana.id } } } },
    orderBy: [{ subject: { name: "asc" } }, { position: "asc" }],
  });
  if (!next) return console.log("A Ana já concluiu todas as aulas. Rode: npx prisma migrate reset e o seed.");
  console.log("1. Concluir aula nova:", next.title, await completeLesson(ana.id, next.id));

  // 2. Repetir a mesma aula: não deve pontuar de novo
  console.log("2. Repetir a mesma aula:", await completeLesson(ana.id, next.id));

  // 3. Aluno não matriculado não pode concluir
  const uxLesson = await prisma.lesson.findFirstOrThrow({ where: { subject: { name: "Fundamentos de UX/UI" }, position: 1 } });
  try {
    await completeLesson(bruno.id, uxLesson.id);
    console.log("3. ERRO: o Bruno não está matriculado e mesmo assim concluiu.");
  } catch (e) {
    console.log("3. Bruno sem matrícula foi bloqueado:", (e as Error).message);
  }

  // 4. Concluir um desafio e repetir
  const challenge = await prisma.challenge.findFirstOrThrow({ where: { title: "Decorador de cache" } });
  console.log("4. Desafio:", await completeChallenge(ana.id, challenge.id));
  console.log("   Repetido:", await completeChallenge(ana.id, challenge.id));

  // 5. Ranking
  const ranking = await getRanking(10);
  console.log("5. Ranking:");
  console.table(ranking.map((u, i) => ({ posicao: i + 1, nome: u.name, pontos: u.totalPoints })));

  // 6. Consistência: total_points deve ser igual à soma do extrato
  const sums = await prisma.pointTransaction.groupBy({ by: ["userId"], _sum: { points: true } });
  const users = await prisma.user.findMany({ select: { id: true, name: true, totalPoints: true } });
  console.log("6. Total x extrato:");
  console.table(
    users.map((u) => {
      const soma = sums.find((s) => s.userId === u.id)?._sum.points ?? 0;
      return { nome: u.name, total_points: u.totalPoints, soma_extrato: soma, confere: u.totalPoints === soma ? "ok" : "DIVERGENTE" };
    }),
  );
}

main()
  .catch((e) => console.error("Falha:", e))
  .finally(() => prisma.$disconnect());