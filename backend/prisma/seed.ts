import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { Role, TaskStatus } from "../src/generated/prisma/client";

const DAY = 24 * 60 * 60 * 1000;
const inDays = (n: number) => new Date(Date.now() + n * DAY);

const SUBJECT_NAMES = [
  "Fundamentos de UX/UI",
  "Desenvolvimento Mobile",
  "Python Avançado",
  "Análise de Dados",
] as const;

async function main() {
  // ---- Usuários (semana 2) ----
  const password = await bcrypt.hash("Senha@123", 12);

  const student = await prisma.user.upsert({
    where: { email: "aluna@educamais.test" },
    update: { password },
    create: { name: "Ana Aluna", email: "aluna@educamais.test", role: Role.STUDENT, password },
  });

  await prisma.user.upsert({
    where: { email: "professor@educamais.test" },
    update: { password },
    create: { name: "Carlos Professor", email: "professor@educamais.test", role: Role.TEACHER, password },
  });

  // ---- Matérias (semana 3) ----
  const subjects: Record<string, string> = {};
  for (const name of SUBJECT_NAMES) {
    const s = await prisma.subject.upsert({ where: { name }, update: {}, create: { name } });
    subjects[name] = s.id;
  }

  // ---- Tarefas de exemplo (só se a aluna ainda não tiver nenhuma) ----
  const existing = await prisma.task.count({ where: { userId: student.id } });
  if (existing === 0) {
    await prisma.task.createMany({
      data: [
        { userId: student.id, subjectId: subjects["Fundamentos de UX/UI"], title: "Criar wireframes da tela de login", dueDate: inDays(2) },
        { userId: student.id, subjectId: subjects["Fundamentos de UX/UI"], title: "Estudo de heurísticas de Nielsen", description: "Resumo com exemplos", dueDate: inDays(7) },
        { userId: student.id, subjectId: subjects["Desenvolvimento Mobile"], title: "Implementar navegação com abas", dueDate: inDays(4) },
        { userId: student.id, subjectId: subjects["Desenvolvimento Mobile"], title: "Publicar protótipo no Expo", dueDate: inDays(10) },
        { userId: student.id, subjectId: subjects["Python Avançado"], title: "Exercícios de decoradores e geradores", dueDate: inDays(-2) },
        { userId: student.id, subjectId: subjects["Python Avançado"], title: "Lista sobre programação assíncrona", dueDate: inDays(5) },
        { userId: student.id, subjectId: subjects["Análise de Dados"], title: "Limpeza do dataset de vendas", dueDate: inDays(3) },
        { userId: student.id, subjectId: subjects["Análise de Dados"], title: "Relatório de visualização com gráficos", dueDate: inDays(-5), status: TaskStatus.COMPLETED, completedAt: inDays(-6) },
      ],
    });
  }

  console.log("Seed concluído: usuários, 4 matérias e 8 tarefas de exemplo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
