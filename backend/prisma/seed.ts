import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { completeLesson, completeChallenge } from "../src/lib/points";
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

const CHALLENGES: { title: string; description: string; points: number; subject: string | null }[] = [
  { title: "Desafio de estreia", description: "Conclua a sua primeira aula no Educa+.", points: 20, subject: null },
  { title: "Protótipo de app", description: "Entregue um protótipo navegável de um aplicativo.", points: 50, subject: "Fundamentos de UX/UI" },
  { title: "Decorador de cache", description: "Implemente um decorador com cache em Python.", points: 30, subject: "Python Avançado" },
];

async function main() {
  // ---- Usuários (semana 2 + segundo aluno para o ranking) ----
const password = await bcrypt.hash("Senha@123", 12);


  const ana = await prisma.user.upsert({
  where: { email: "aluna@educamais.test" },
  update: { password },
  create: { name: "Ana Aluna", email: "aluna@educamais.test", role: Role.STUDENT, password },
});

  const bruno = await prisma.user.upsert({
    where: { email: "aluno@educamais.test" },
    update: { password },
    create: { name: "Bruno Aluno", email: "aluno@educamais.test", role: Role.STUDENT, password },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "professor@educamais.test" },
    update: { password },
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
        create: { subjectId: subject.id, position, title, content: `Conteúdo da aula "${title}".` },
      });
    }
  }

  // ---- Tarefas de exemplo (só se a Ana ainda não tiver nenhuma) ----
  const existingTasks = await prisma.task.count({ where: { userId: ana.id } });
  if (existingTasks === 0) {
    await prisma.task.createMany({
      data: [
        { userId: ana.id, subjectId: subjects["Fundamentos de UX/UI"], title: "Criar wireframes da tela de login", dueDate: inDays(2) },
        { userId: ana.id, subjectId: subjects["Fundamentos de UX/UI"], title: "Estudo de heurísticas de Nielsen", description: "Resumo com exemplos", dueDate: inDays(7) },
        { userId: ana.id, subjectId: subjects["Desenvolvimento Mobile"], title: "Implementar navegação com abas", dueDate: inDays(4) },
        { userId: ana.id, subjectId: subjects["Desenvolvimento Mobile"], title: "Publicar protótipo no Expo", dueDate: inDays(10) },
        { userId: ana.id, subjectId: subjects["Python Avançado"], title: "Exercícios de decoradores e geradores", dueDate: inDays(-2) }, // atrasada
        { userId: ana.id, subjectId: subjects["Python Avançado"], title: "Lista sobre programação assíncrona", dueDate: inDays(5) },
        { userId: ana.id, subjectId: subjects["Análise de Dados"], title: "Limpeza do dataset de vendas", dueDate: inDays(3) },
        { userId: ana.id, subjectId: subjects["Análise de Dados"], title: "Relatório de visualização com gráficos", dueDate: inDays(-5), status: TaskStatus.COMPLETED, completedAt: inDays(-6) }, // concluída
      ],
    });
  }

  // ---- Desafios (semana 5) ----
  const challenges: Record<string, string> = {};
  for (const c of CHALLENGES) {
    const found = await prisma.challenge.findFirst({ where: { title: c.title } });
    const challenge =
      found ??
      (await prisma.challenge.create({
        data: {
          title: c.title,
          description: c.description,
          points: c.points,
          subjectId: c.subject ? subjects[c.subject] : null,
        },
      }));
    challenges[c.title] = challenge.id;
  }

  // ---- Matrículas (semana 5) ----
  const enrollments: [string, string[]][] = [
    [ana.id, Object.keys(subjects)], // Ana acompanha as 4 matérias
    [bruno.id, ["Desenvolvimento Mobile", "Python Avançado"]],
  ];
  for (const [userId, names] of enrollments) {
    for (const name of names) {
      await prisma.enrollment.upsert({
        where: { userId_subjectId: { userId, subjectId: subjects[name] } },
        update: {},
        create: { userId, subjectId: subjects[name] },
      });
    }
  }

  // ---- Progresso e pontos, pela regra oficial (semana 5) ----
  const lessonOf = (subjectName: string, position: number) =>
    prisma.lesson.findUniqueOrThrow({
      where: { subjectId_position: { subjectId: subjects[subjectName], position } },
    });

  for (const position of [1, 2, 3]) {
    await completeLesson(ana.id, (await lessonOf("Fundamentos de UX/UI", position)).id);
  }
  await completeLesson(ana.id, (await lessonOf("Python Avançado", 1)).id);
  await completeChallenge(ana.id, challenges["Desafio de estreia"]);
  await completeLesson(bruno.id, (await lessonOf("Desenvolvimento Mobile", 1)).id);

  // ---- Discussão e Comentário na Comunidade (Semana 6) ----
  const discussion = await prisma.discussion.create({
    data: {
      authorId: ana.id, 
      title: "Dúvida sobre a matéria de Desenvolvimento Mobile",
      content: "Alguém pode me ajudar a entender melhor como trabalhar com React Native?",
    },
  });

  await prisma.comment.create({
    data: {
      discussionId: discussion.id,
      authorId: teacher.id, // Professor respondendo
      content: "Claro! Posso explicar na próxima aula.",
    },
  });

  console.log("Seed concluído: 3 usuários, 4 matérias, 12 aulas, 8 tarefas, matrículas, desafios, progresso, pontos e comunidade.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
