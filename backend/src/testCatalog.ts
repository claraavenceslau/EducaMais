import { prisma } from "./lib/prisma";
import { SubjectLevel } from "./generated/prisma/client";

async function main() {
  // 1. Catálogo: título, descrição, nível e instrutor (só publicadas)
  const catalog = await prisma.subject.findMany({
    where: { isPublished: true },
    select: { name: true, description: true, level: true, instructor: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
  console.log("1. Catálogo (publicadas):");
  console.table(catalog.map((s) => ({ titulo: s.name, nivel: s.level, instrutor: s.instructor.name })));

  // 2. Filtro por nível
  const advanced = await prisma.subject.findMany({ where: { isPublished: true, level: SubjectLevel.ADVANCED } });
  console.log("2. Nível avançado:", advanced.map((s) => s.name));

  // 3. Aulas de uma matéria, em ordem
  const lessons = await prisma.lesson.findMany({
    where: { subject: { name: "Python Avançado" } },
    orderBy: { position: "asc" },
    select: { position: true, title: true, points: true },
  });
  console.log("3. Aulas de Python Avançado:");
  console.table(lessons);

  // 4. Quantidade de aulas e de tarefas por matéria
  const counts = await prisma.subject.findMany({
    select: { name: true, _count: { select: { lessons: true, tasks: true } } },
  });
  console.log("4. Aulas e tarefas por matéria:");
  console.table(counts.map((s) => ({ materia: s.name, aulas: s._count.lessons, tarefas: s._count.tasks })));
}

main()
  .catch((e) => console.error("Falha:", e))
  .finally(() => prisma.$disconnect());