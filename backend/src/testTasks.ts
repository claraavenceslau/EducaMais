import { prisma } from "./lib/prisma";
import { TaskStatus } from "./generated/prisma/client";

async function main() {
  const student = await prisma.user.findUniqueOrThrow({ where: { email: "aluna@educamais.test" } });
  const userId = student.id;
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const all = await prisma.task.findMany({ where: { userId }, include: { subject: true }, orderBy: { dueDate: "asc" } });
  console.log("1. Todas as tarefas:");
  console.table(all.map((t) => ({ titulo: t.title, materia: t.subject?.name ?? "-", prazo: t.dueDate.toISOString().slice(0, 10), status: t.status })));

  const math = await prisma.task.findMany({ where: { userId, subject: { name: "Fundamentos de UX/UI" } } });
  console.log("2. Fundamentos de UX/UI:", math.map((t) => t.title));

  const soon = await prisma.task.findMany({ where: { userId, status: TaskStatus.PENDING, dueDate: { gte: now, lte: in7 } }, orderBy: { dueDate: "asc" } });
  const overdue = await prisma.task.findMany({ where: { userId, status: TaskStatus.PENDING, dueDate: { lt: now } } });
  console.log("3. Próximos 7 dias:", soon.map((t) => t.title));
  console.log("   Atrasadas:", overdue.map((t) => t.title));

  const first = all.find((t) => t.status === TaskStatus.PENDING);
  if (first) {
    const done = await prisma.task.update({ where: { id: first.id }, data: { status: TaskStatus.COMPLETED, completedAt: new Date() } });
    console.log("4. Concluída:", done.title, "em", done.completedAt);
  }

  const counts = await prisma.task.groupBy({ by: ["status"], where: { userId }, _count: true });
  console.log("5. Por status:", counts);
}

main()
  .catch((e) => console.error("Falha:", e))
  .finally(() => prisma.$disconnect());