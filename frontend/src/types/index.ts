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

// ---- Avaliações de cursos ----
export type Stars = 1 | 2 | 3 | 4 | 5;

export type Review = {
  id: string;
  courseId: string;
  studentId: string;
  authorName: string; // nome mostrado; "Aluno anônimo" quando anonymous = true
  anonymous: boolean;
  stars: Stars;
  comment?: string;
  createdAt: string;
  updatedAt: string;
};

// ---- Demandas da comunidade escolar ----
export type DemandCategory =
  | 'infraestrutura'
  | 'transporte'
  | 'alimentacao'
  | 'seguranca'
  | 'pedagogico'
  | 'outros';

export type DemandStatus =
  | 'aberta'
  | 'em_analise'
  | 'em_andamento'
  | 'resolvida'
  | 'recusada'
  | 'cancelada';

export type AttachmentKind = 'image' | 'document';

export type Attachment = {
  id: string;
  kind: AttachmentKind;
  name: string;
  uri: string;
  mimeType?: string;
  sizeBytes?: number;
};

export type DemandLocation = {
  source: 'gps' | 'manual';
  description: string; // endereço ou ponto de referência, sempre preenchido
  latitude?: number;
  longitude?: number;
  accuracy?: number; // metros
};

export type DemandEvent = {
  id: string;
  status: DemandStatus;
  text: string;
  at: string;
};

export type Demand = {
  id: string;
  protocol: string; // AAAA-NNNN, mostrado ao usuário
  category: DemandCategory;
  title: string;
  description: string;
  status: DemandStatus;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
  location?: DemandLocation;
  timeline: DemandEvent[];
  seiProcess?: string; // número do processo no SEI, preenchido pela integração (futuro)
};

// ---- Avisos ----
export type NoticeCategory = 'geral' | 'urgente' | 'evento' | 'pedagogico';

export type Notice = {
  id: string;
  title: string;
  body: string;
  category: NoticeCategory;
  publishedAt: string;
  author: string;
  read: boolean;
};

// ---- Agendamento de atendimentos ----
export type ServiceKey = 'secretaria' | 'coordenacao' | 'direcao' | 'orientacao';
export type AppointmentStatus = 'agendado' | 'cancelado' | 'concluido';

export type Appointment = {
  id: string;
  service: ServiceKey;
  date: string; // AAAA-MM-DD
  time: string; // HH:MM
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
  reminderId?: string; // id da notificação local de lembrete
};

// ---- Preferências e perfil ----
export type Preferences = {
  notifications: { notices: boolean; demands: boolean; appointments: boolean; tasks: boolean };
  privacy: {
    shareLocationByDefault: boolean;
    reviewIdentity: 'nome' | 'anonimo';
  };
};

export type Profile = {
  name?: string;
  phone?: string;
  classGroup?: string; // turma (aluno) ou disciplinas (professor)
};

export const DEFAULT_PREFERENCES: Preferences = {
  notifications: { notices: true, demands: true, appointments: true, tasks: false },
  privacy: { shareLocationByDefault: false, reviewIdentity: 'nome' },
};

export type AppData = {
  tasks: Task[];
  courses: Course[];
  discussions: Discussion[];
  achievements: Achievement[];
  ranking: RankingEntry[];
  activity: ActivityItem[];
  progress: Progress;
  reviews: Review[];
  demands: Demand[];
  notices: Notice[];
  appointments: Appointment[];
  preferences: Preferences;
  profile: Profile;
};

export const EMPTY_DATA: AppData = {
  tasks: [],
  courses: [],
  discussions: [],
  achievements: [],
  ranking: [],
  activity: [],
  progress: { points: 0, level: 1, xp: 0, xpNext: 100, streak: 0 },
  reviews: [],
  demands: [],
  notices: [],
  appointments: [],
  preferences: DEFAULT_PREFERENCES,
  profile: {},
};
