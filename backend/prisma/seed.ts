import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { Role, TaskStatus, SubjectLevel } from "../src/generated/prisma/client";

const DAY = 24 * 60 * 60 * 1000;
const inDays = (n: number) => new Date(Date.now() + n * DAY);


const CATALOG = [
  {
    name: "Fundamentos de UX/UI",
    description: "Princípios de experiência e interface do usuário: pesquisa, wireframes e prototipação.",
    level: SubjectLevel.BEGINNER,
    lessons: ["O que é UX e UI", "Pesquisa com usuários", "Wireframes e protótipos"],
  },
  {
    name: "Desenvolvimento Mobile",
    description: "Criação de aplicativos com React Native e Expo, da navegação ao consumo de APIs.",
    level: SubjectLevel.INTERMEDIATE,
    lessons: ["Introdução ao React Native", "Navegação entre telas", "Consumindo uma API"],
  },
  {
    name: "Python Avançado",
    description: "Recursos avançados da linguagem: decoradores, geradores e programação assíncrona.",
    level: SubjectLevel.ADVANCED,
    lessons: ["Decoradores", "Geradores e iteradores", "Programação assíncrona"],
  },
  {
    name: "Análise de Dados",
    description: "Limpeza, exploração e visualização de dados para apoiar decisões.",
    level: SubjectLevel.INTERMEDIATE,
    lessons: ["Limpeza de dados", "Análise exploratória", "Visualização com gráficos"],
  },
];

async function main() {

  const password = "Senha@123";

  const student = await prisma.user.upsert({
    where: { email: "aluna@educamais.test" },
    update: {},
    create: { name: "Ana Aluna", email: "aluna@educamais.test", role: Role.STUDENT, password },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "professor@educamais.test" },
    update: {},
    create: { name: "Carlos Professor", email: "professor@educamais.test", role: Role.TEACHER, password },
  });

  // ---- Matérias do catálogo e aulas (semanas 3 e 4) ----
  const subjects: Record<string, string> = {};
  for (const item of CATALOG) {
    const subject = await prisma.subject.upsert({
      where: { name: item.name },
      update: {},
      create: {
        name: item.name,
        description: item.description,
        level: item.level,
        isPublished: true,
        instructorId: teacher.id,
      },
    });
    subjects[item.name] = subject.id;

    for (const [index, title] of item.lessons.entries()) {
      const position = index + 1;
      await prisma.lesson.upsert({
        where: { subjectId_position: { subjectId: subject.id, position } },
        update: {},
        create: {
          subjectId: subject.id,
          position,
          title,
          content: `Conteúdo da aula "${title}".`,
        },
      });
    }
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
        { userId: student.id, subjectId: subjects["Python Avançado"], title: "Exercícios de decoradores e geradores", dueDate: inDays(-2) }, // atrasada
        { userId: student.id, subjectId: subjects["Python Avançado"], title: "Lista sobre programação assíncrona", dueDate: inDays(5) },
        { userId: student.id, subjectId: subjects["Análise de Dados"], title: "Limpeza do dataset de vendas", dueDate: inDays(3) },
        { userId: student.id, subjectId: subjects["Análise de Dados"], title: "Relatório de visualização com gráficos", dueDate: inDays(-5), status: TaskStatus.COMPLETED, completedAt: inDays(-6) }, // concluída
      ],
    });
  }

  console.log("Seed concluído: usuários, 4 matérias do catálogo, 12 aulas e 8 tarefas de exemplo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());