import type { AppData, Course, Discussion, Lesson, User } from '../types';
import { addDays } from '../utils/dates';

// Dados de demonstração inspirados nos protótipos (Ana Souza, Rafael Mendes,
// Fundamentos de UX/UI, Desenvolvimento Mobile, Python Avançado, Análise de Dados).
// Quando existir back-end, estes dados saem daqui e passam a vir da API.

function lessons(prefix: string, titles: string[], doneCount: number): Lesson[] {
  return titles.map((title, i) => ({
    id: `${prefix}-l${i + 1}`,
    title,
    minutes: 10 + ((i * 7) % 20),
    done: i < doneCount,
  }));
}

function minutesAgo(now: Date, minutes: number): string {
  return new Date(now.getTime() - minutes * 60_000).toISOString();
}

function discussions(now: Date): Discussion[] {
  return [
    {
      id: 'd1',
      author: 'Ana Souza',
      title: 'Como organizar os estudos?',
      body: 'Quais técnicas vocês usam para manter uma rotina? Estou com dificuldade de equilibrar as disciplinas.',
      subject: 'Design',
      createdAt: minutesAgo(now, 90),
      replies: [
        { id: 'd1-r1', author: 'Rafael Mendes', body: 'Eu uso blocos de 25 minutos com pausas curtas.', createdAt: minutesAgo(now, 60) },
        { id: 'd1-r2', author: 'Mariana Costa', body: 'Montar um quadro semanal ajuda muito a enxergar prioridades.', createdAt: minutesAgo(now, 30) },
      ],
    },
    {
      id: 'd2',
      author: 'Rafael Mendes',
      title: 'Dúvidas sobre Mobile II',
      body: 'Alguém já terminou a parte de prototipação? Quero comparar como cada grupo organizou as telas.',
      subject: 'Mobile',
      createdAt: minutesAgo(now, 60 * 26),
      replies: [
        { id: 'd2-r1', author: 'Ana Souza', body: 'Terminei ontem, posso mostrar como ficou.', createdAt: minutesAgo(now, 60 * 22) },
        { id: 'd2-r2', author: 'Carlos Lima', body: 'Lembrem de revisar os estados de carregamento e de erro.', createdAt: minutesAgo(now, 60 * 20) },
        { id: 'd2-r3', author: 'Ana Souza', body: 'Boa lembrança, eu tinha esquecido do estado vazio.', createdAt: minutesAgo(now, 60 * 19) },
      ],
    },
  ];
}

function studentData(user: User, now: Date): AppData {
  const courses: Course[] = [
    {
      id: 'c1', title: 'Fundamentos de UX/UI', theme: 'Design', level: 'Iniciante',
      teacher: 'Prof. Mariana Costa', rating: 4.8, enrolled: true, status: 'publicado', students: 0, contentCreated: 100,
      description: 'Princípios de experiência do usuário, hierarquia visual e prototipação de interfaces.',
      lessons: lessons('c1', ['O que é UX', 'Pesquisa com usuários', 'Hierarquia visual', 'Prototipação'], 3),
    },
    {
      id: 'c2', title: 'Desenvolvimento Mobile', theme: 'Mobile', level: 'Intermediário',
      teacher: 'Prof. Carlos Lima', rating: 4.7, enrolled: true, status: 'publicado', students: 0, contentCreated: 100,
      description: 'Construção de aplicativos com React Native: navegação, formulários e componentes.',
      lessons: lessons('c2', ['Ambiente e primeiro app', 'Componentes e estilos', 'Navegação'], 1),
    },
    {
      id: 'c3', title: 'Python Avançado', theme: 'Programação', level: 'Avançado',
      teacher: 'Prof. João Silva', rating: 4.9, enrolled: false, status: 'publicado', students: 0, contentCreated: 100,
      description: 'Orientação a objetos, geradores, decoradores e boas práticas de projeto.',
      lessons: lessons('c3', ['Orientação a objetos', 'Geradores', 'Decoradores'], 0),
    },
    {
      id: 'c4', title: 'Análise de Dados', theme: 'Dados', level: 'Intermediário',
      teacher: 'Prof. Maria Santos', rating: 4.6, enrolled: true, status: 'publicado', students: 0, contentCreated: 100,
      description: 'Limpeza, exploração e visualização de dados para apoiar decisões.',
      lessons: lessons('c4', ['Introdução a dados', 'Limpeza', 'Exploração', 'Visualização', 'Projeto final'], 1),
    },
  ];

  return {
    tasks: [
      { id: 't1', title: 'Revisar capítulo 3', description: 'Revisão para a prova', subject: 'Mobile II', dueDate: addDays(now, 0), done: false },
      { id: 't2', title: 'Entregar atividade', description: 'Projeto de interface visual', subject: 'Design', dueDate: addDays(now, 1), done: false },
      { id: 't3', title: 'Assistir aula 04', description: 'Fundamentos de UX', subject: 'UX/UI', dueDate: addDays(now, -2), done: true },
    ],
    courses,
    discussions: discussions(now),
    achievements: [
      { id: 'a1', title: 'Primeiro Passo', description: 'Completou a primeira tarefa', unlocked: true },
      { id: 'a2', title: 'Estudante Dedicado', description: '7 dias consecutivos de estudo', unlocked: true },
      { id: 'a3', title: 'Voz Ativa', description: '10 respostas na comunidade', unlocked: true },
      { id: 'a4', title: 'Foco Total', description: '5 tarefas concluídas em um dia', unlocked: false },
      { id: 'a5', title: 'Acelerador', description: 'Complete 20 tarefas no mês', unlocked: false },
      { id: 'a6', title: 'Elite', description: 'Alcance o topo do ranking', unlocked: false },
    ],
    ranking: [
      { name: 'Ana Souza', points: 480 },
      { name: 'Rafael Mendes', points: 410 },
      { name: user.name, points: 250 },
      { name: 'Mariana Costa', points: 190 },
    ],
    activity: [
      { id: 'h1', text: 'Tarefa concluída', detail: 'Assistir aula 04', points: 10 },
      { id: 'h2', text: 'Curso iniciado', detail: 'Análise de Dados', points: 20 },
      { id: 'h3', text: 'Resposta na comunidade', detail: 'Como organizar os estudos?', points: 10 },
    ],
    progress: { points: 250, level: 1, xp: 250, xpNext: 300, streak: 7 },
  };
}

function teacherData(user: User, now: Date): AppData {
  const own = (c: Omit<Course, 'teacher' | 'enrolled' | 'rating'>): Course => ({
    ...c, teacher: user.name, enrolled: false, rating: 0,
  });
  return {
    tasks: [],
    courses: [
      own({
        id: 'p1', title: 'Fundamentos de UX/UI', theme: 'Design', level: 'Iniciante', status: 'publicado', students: 34, contentCreated: 80,
        description: 'Princípios de experiência do usuário e prototipação.',
        lessons: lessons('p1', ['O que é UX', 'Pesquisa com usuários', 'Hierarquia visual', 'Prototipação'], 0),
      }),
      own({
        id: 'p2', title: 'Prototipação Mobile', theme: 'Mobile', level: 'Intermediário', status: 'publicado', students: 22, contentCreated: 55,
        description: 'Do wireframe ao protótipo navegável de um aplicativo.',
        lessons: lessons('p2', ['Wireframes', 'Fluxos', 'Protótipo navegável'], 0),
      }),
      own({
        id: 'p3', title: 'Gestão de Projetos', theme: 'Gestão', level: 'Iniciante', status: 'rascunho', students: 0, contentCreated: 20,
        description: 'Planejamento, prazos e acompanhamento de equipes.',
        lessons: lessons('p3', ['Escopo e planejamento'], 0),
      }),
    ],
    discussions: discussions(now),
    achievements: [],
    ranking: [],
    activity: [
      { id: 'r1', text: 'Ana Souza enviou tarefa em UX/UI', detail: 'há 15 min' },
      { id: 'r2', text: 'Rafael Mendes perguntou na comunidade', detail: 'há 42 min' },
      { id: 'r3', text: '12 alunos concluíram Aula 04', detail: 'há 2 h' },
      { id: 'r4', text: 'Prototipação Mobile recebeu avaliação 5.0', detail: 'Ontem' },
    ],
    progress: { points: 0, level: 1, xp: 0, xpNext: 100, streak: 0 },
  };
}

export function buildSeed(user: User, now: Date = new Date()): AppData {
  return user.role === 'professor' ? teacherData(user, now) : studentData(user, now);
}
