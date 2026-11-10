import type { Notice, NoticeCategory } from '../types';

export const NOTICE_LABEL: Record<NoticeCategory, string> = {
  geral: 'Geral',
  urgente: 'Urgente',
  evento: 'Evento',
  pedagogico: 'Pedagógico',
};

export const NOTICE_TONE: Record<NoticeCategory, 'info' | 'success' | 'warn' | 'neutral'> = {
  geral: 'neutral',
  urgente: 'warn',
  evento: 'success',
  pedagogico: 'info',
};

export type NoticeFilter = 'todos' | NoticeCategory;

/** Mais recentes primeiro; avisos urgentes não lidos sobem para o topo. */
export function sortNotices(notices: Notice[]): Notice[] {
  const weight = (n: Notice) => (n.category === 'urgente' && !n.read ? 1 : 0);
  return [...notices].sort((a, b) => weight(b) - weight(a) || b.publishedAt.localeCompare(a.publishedAt));
}

export function filterNotices(notices: Notice[], filter: NoticeFilter): Notice[] {
  const list = filter === 'todos' ? notices : notices.filter((n) => n.category === filter);
  return sortNotices(list);
}

export const unreadCount = (notices: Notice[]): number => notices.filter((n) => !n.read).length;
