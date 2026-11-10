// Contratos (somente tipos) para quando existirem a API, o painel web administrativo e a
// integração com o SEI. Nada aqui é usado em execução: serve para combinar o formato dos
// dados com quem for fazer o back-end e para o front já nascer tipado.
import type {
  AppointmentStatus, DemandCategory, DemandLocation, DemandStatus, NoticeCategory, ServiceKey, Stars,
} from './index';

/** Caminhos previstos. Os nomes podem mudar quando o back-end existir. */
export const API_PATHS = {
  demands: '/demandas',
  demand: (id: string) => `/demandas/${id}`,
  demandAttachments: (id: string) => `/demandas/${id}/anexos`,
  notices: '/avisos',
  appointments: '/agendamentos',
  availability: (service: ServiceKey, date: string) => `/atendimentos/${service}/horarios?data=${date}`,
  courseReviews: (courseId: string) => `/cursos/${courseId}/avaliacoes`,
  devices: '/dispositivos',
} as const;

/** App -> API: nova demanda. Anexos sobem à parte (multipart) e entram pelo id devolvido. */
export type CreateDemandRequest = {
  category: DemandCategory;
  title: string;
  description: string;
  location?: DemandLocation;
  attachmentIds: string[];
};

/** Painel web -> API: mudança de status feita pela gestão escolar. */
export type UpdateDemandStatusRequest = {
  status: DemandStatus;
  message: string; // texto mostrado na linha do tempo do app
};

/** API -> SEI: dados enviados ao abrir o processo da demanda. */
export type SeiOpenProcessRequest = {
  demandProtocol: string;
  category: DemandCategory;
  subject: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  attachmentUrls: string[];
};

/** SEI -> API: retorno da abertura e andamentos, que viram eventos da linha do tempo. */
export type SeiProcessResponse = {
  processNumber: string; // ex.: 23072.201234/2026-11
  unit: string; // unidade responsável
  updates: { at: string; text: string; status?: DemandStatus }[];
};

/** Painel web -> API: publicar aviso. */
export type CreateNoticeRequest = {
  title: string;
  body: string;
  category: NoticeCategory;
  audience: 'todos' | 'alunos' | 'professores';
};

/** API -> App: horários livres de um setor em um dia. */
export type AvailabilityResponse = { date: string; service: ServiceKey; freeTimes: string[] };

export type CreateAppointmentRequest = {
  service: ServiceKey;
  date: string;
  time: string;
  reason: string;
};

export type UpdateAppointmentRequest = { status: AppointmentStatus };

/** App -> API: avaliação do curso. O servidor confere matrícula e progresso mínimo. */
export type CreateReviewRequest = {
  stars: Stars;
  comment?: string;
  anonymous: boolean;
};

/** App -> API: registra o aparelho para push (token vem de services/notifications.getPushToken). */
export type RegisterDeviceRequest = {
  pushToken: string;
  platform: 'android' | 'ios';
};
