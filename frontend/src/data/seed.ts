import { DEFAULT_PREFERENCES } from '../types';
import type { AppData, Course, Demand, Discussion, Lesson, Notice, Review, Stars, User } from '../types';
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


const REVIEWERS = [
  'Ana Souza', 'Rafael Mendes', 'Bruna Lima', 'Diego Alves', 'Camila Rocha',
  'Lucas Prado', 'Julia Nunes', 'Pedro Matos', 'Sofia Dias', 'Tiago Reis',
];

const COMMENTS: Record<number, string> = {
  0: 'Conteúdo claro e bem organizado.',
  2: 'As aulas práticas ajudaram muito.',
};

/** Avaliações de outros alunos, só para a demonstração. */
function fakeReviews(courseId: string, stars: Stars[], now: Date): Review[] {
  return stars.map((s, i) => {
    const at = minutesAgo(now, 60 * 24 * (i + 2));
    return {
      id: `${courseId}-rv${i + 1}`,
      courseId,
      studentId: `fake-${i}`,
      authorName: REVIEWERS[i % REVIEWERS.length],
      anonymous: false,
      stars: s,
      comment: COMMENTS[i],
      createdAt: at,
      updatedAt: at,
    };
  });
}

function demands(now: Date): Demand[] {
  const day = 60 * 24;
  return [
    {
      id: 'dm1',
      protocol: `${now.getFullYear()}-0007`,
      category: 'infraestrutura',
      title: 'Lâmpadas queimadas no corredor B',
      description: 'Três lâmpadas do corredor B, no segundo andar, estão queimadas há mais de uma semana e o local fica escuro no fim da tarde.',
      status: 'em_andamento',
      createdAt: minutesAgo(now, day * 5),
      updatedAt: minutesAgo(now, day * 2),
      attachments: [],
      location: { source: 'manual', description: 'Corredor B, segundo andar' },
      seiProcess: '23072.201234/2026-11',
      timeline: [
        { id: 'dm1-e1', status: 'aberta', text: 'Demanda registrada.', at: minutesAgo(now, day * 5) },
        { id: 'dm1-e2', status: 'em_analise', text: 'A equipe da escola começou a analisar.', at: minutesAgo(now, day * 4) },
        { id: 'dm1-e3', status: 'em_andamento', text: 'Troca das lâmpadas agendada com a manutenção.', at: minutesAgo(now, day * 2) },
      ],
    },
    {
      id: 'dm2',
      protocol: `${now.getFullYear()}-0008`,
      category: 'transporte',
      title: 'Atraso frequente do ônibus da rota 12',
      description: 'Nesta semana o ônibus da rota 12 chegou mais de 20 minutos atrasado em três dias seguidos.',
      status: 'aberta',
      createdAt: minutesAgo(now, day),
      updatedAt: minutesAgo(now, day),
      attachments: [],
      timeline: [{ id: 'dm2-e1', status: 'aberta', text: 'Demanda registrada.', at: minutesAgo(now, day) }],
    },
  ];
}

function notices(now: Date): Notice[] {
  const h = 60;
  return [
    {
      id: 'n1', category: 'urgente', author: 'Direção', read: false, publishedAt: minutesAgo(now, h * 3),
      title: 'Aulas suspensas na sexta-feira',
      body: 'Por causa de manutenção na rede elétrica, não haverá aula na próxima sexta-feira. As atividades serão repostas no sábado seguinte, em horário a confirmar.',
    },
    {
      id: 'n2', category: 'evento', author: 'Coordenação', read: false, publishedAt: minutesAgo(now, h * 26),
      title: 'Feira de Ciências abre inscrições',
      body: 'Os grupos podem inscrever projetos na secretaria até o fim do mês. Cada grupo pode ter de três a cinco estudantes e um professor orientador.',
    },
    {
      id: 'n3', category: 'pedagogico', author: 'Coordenação pedagógica', read: false, publishedAt: minutesAgo(now, h * 50),
      title: 'Entrega de boletins',
      body: 'Os boletins do trimestre serão entregues aos responsáveis em reunião, na próxima semana. O horário de cada turma está no mural da secretaria.',
    },
    {
      id: 'n4', category: 'geral', author: 'Secretaria', read: true, publishedAt: minutesAgo(now, h * 24 * 6),
      title: 'Novo cardápio da merenda',
      body: 'O cardápio do mês foi atualizado e inclui opções para estudantes com restrições alimentares. Quem precisa de adaptação deve procurar a secretaria.',
    },
    {
      id: 'n5', category: 'geral', author: 'Secretaria', read: true, publishedAt: minutesAgo(now, h * 24 * 12),
      title: 'Atualização de dados cadastrais',
      body: 'Pedimos que as famílias confirmem telefone e endereço na secretaria, para que os avisos cheguem corretamente.',
    },
  ];
}

function extras(now: Date, reviews: Review[]) {
  return {
    reviews,
    demands: demands(now),
    notices: notices(now),
    appointments: [],
    preferences: DEFAULT_PREFERENCES,
    profile: {},
  };
}

function studentData(user: User, now: Date): AppData {
  const courses: Course[] = [
    {
      id: 'c1', title: 'Fundamentos de UX/UI', theme: 'Design', level: 'Iniciante',
      teacher: 'Prof. Mariana Costa', enrolled: true, status: 'publicado', students: 0, contentCreated: 100,
      description: 'Princípios de experiência do usuário, hierarquia visual e prototipação de interfaces.',
      lessons: lessons('c1', ['O que é UX', 'Pesquisa com usuários', 'Hierarquia visual', 'Prototipação'], 3),
    },
    {
      id: 'c2', title: 'Desenvolvimento Mobile', theme: 'Mobile', level: 'Intermediário',
      teacher: 'Prof. Carlos Lima', enrolled: true, status: 'publicado', students: 0, contentCreated: 100,
      description: 'Construção de aplicativos com React Native: navegação, formulários e componentes.',
      lessons: lessons('c2', ['Ambiente e primeiro app', 'Componentes e estilos', 'Navegação'], 1),
    },
    {
      id: 'c3', title: 'Python Avançado', theme: 'Programação', level: 'Avançado',
      teacher: 'Prof. João Silva', enrolled: false, status: 'publicado', students: 0, contentCreated: 100,
      description: 'Orientação a objetos, geradores, decoradores e boas práticas de projeto.',
      lessons: lessons('c3', ['Orientação a objetos', 'Geradores', 'Decoradores'], 0),
    },
    {
      id: 'c4', title: 'Análise de Dados', theme: 'Dados', level: 'Intermediário',
      teacher: 'Prof. Maria Santos', enrolled: true, status: 'publicado', students: 0, contentCreated: 100,
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
    ...extras(now, [
      ...fakeReviews('c1', [5, 5, 5, 4, 5], now),
      ...fakeReviews('c2', [5, 5, 4, 5, 4, 5, 5], now),
      ...fakeReviews('c3', [5, 5, 5, 5, 5, 5, 5, 5, 4, 5], now),
      ...fakeReviews('c4', [5, 4, 5, 4, 5, 4, 5], now),
    ]),
  };
}

function teacherData(user: User, now: Date): AppData {
  const own = (c: Omit<Course, 'teacher' | 'enrolled'>): Course => ({
    ...c, teacher: user.name, enrolled: false,
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
    ...extras(now, [
      ...fakeReviews('p1', [5, 5, 4, 5, 5, 4], now),
      ...fakeReviews('p2', [5, 5, 5], now),
    ]),
  };
}

export function buildSeed(user: User, now: Date = new Date()): AppData {
  return user.role === 'professor' ? teacherData(user, now) : studentData(user, now);
}
