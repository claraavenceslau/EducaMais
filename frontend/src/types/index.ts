import type { AccountRole } from '../services/authService';

export type { AccountRole };

export type User = {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  subject: string; // disciplina ou curso (etiqueta do cartão)
  dueDate: string; // AAAA-MM-DD
  done: boolean;
};

export type CourseTheme = 'Design' | 'Mobile' | 'Programação' | 'Dados' | 'Gestão';
export type CourseLevel = 'Iniciante' | 'Intermediário' | 'Avançado';
export type CourseStatus = 'publicado' | 'rascunho';

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  done: boolean;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  theme: CourseTheme;
  level: CourseLevel;
  teacher: string;
  rating: number;
  lessons: Lesson[];
  enrolled: boolean; // visão do aluno
  status: CourseStatus; // visão do professor
  students: number; // visão do professor
  contentCreated: number; // visão do professor, de 0 a 100
};

export type Reply = {
  id: string;
  author: string;
  body: string;
  createdAt: string; // data e hora em ISO
};

export type Discussion = {
  id: string;
  author: string;
  title: string;
  body: string;
  subject: string;
  createdAt: string;
  replies: Reply[];
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

export type RankingEntry = { name: string; points: number };

export type ActivityItem = {
  id: string;
  text: string;
  detail?: string;
  points?: number;
};

export type Progress = {
  points: number;
  level: number;
  xp: number;
  xpNext: number;
  streak: number;
};

export type AppData = {
  tasks: Task[];
  courses: Course[];
  discussions: Discussion[];
  achievements: Achievement[];
  ranking: RankingEntry[];
  activity: ActivityItem[];
  progress: Progress;
};

export const EMPTY_DATA: AppData = {
  tasks: [],
  courses: [],
  discussions: [],
  achievements: [],
  ranking: [],
  activity: [],
  progress: { points: 0, level: 1, xp: 0, xpNext: 100, streak: 0 },
};
