import type { Demand, DemandCategory, DemandStatus } from '../types';

export const CATEGORIES: { key: DemandCategory; label: string; icon: string; hint: string }[] = [
  { key: 'infraestrutura', label: 'Infraestrutura', icon: 'construct-outline', hint: 'Salas, banheiros, iluminação, reparos' },
  { key: 'transporte', label: 'Transporte', icon: 'bus-outline', hint: 'Ônibus escolar, rotas, horários' },
  { key: 'alimentacao', label: 'Alimentação escolar', icon: 'restaurant-outline', hint: 'Merenda, cardápio, restrições' },
  { key: 'seguranca', label: 'Segurança', icon: 'shield-checkmark-outline', hint: 'Entrada, portões, ocorrências' },
  { key: 'pedagogico', label: 'Pedagógico', icon: 'book-outline', hint: 'Material, aulas, atendimento' },
  { key: 'outros', label: 'Outros', icon: 'ellipsis-horizontal-circle-outline', hint: 'Qualquer outro assunto' },
];

export const categoryLabel = (key: DemandCategory): string =>
  CATEGORIES.find((c) => c.key === key)?.label ?? 'Outros';

export const STATUS_LABEL: Record<DemandStatus, string> = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  em_andamento: 'Em andamento',
  resolvida: 'Resolvida',
  recusada: 'Recusada',
  cancelada: 'Cancelada',
};

export type StatusTone = 'info' | 'success' | 'warn' | 'neutral';

export const STATUS_TONE: Record<DemandStatus, StatusTone> = {
  aberta: 'info',
  em_analise: 'warn',
  em_andamento: 'warn',
  resolvida: 'success',
  recusada: 'neutral',
  cancelada: 'neutral',
};

/**
 * Caminhos permitidos entre status. Quem muda o status é a gestão escolar (painel web,
 * no futuro); o app só mostra. Aqui o mapa serve ao modo de demonstração e como contrato.
 */
export const STATUS_FLOW: Record<DemandStatus, DemandStatus[]> = {
  aberta: ['em_analise', 'recusada'],
  em_analise: ['em_andamento', 'recusada'],
  em_andamento: ['resolvida'],
  resolvida: [],
  recusada: [],
  cancelada: [],
};

export const STATUS_EVENT_TEXT: Record<DemandStatus, string> = {
  aberta: 'Demanda registrada.',
  em_analise: 'A equipe da escola começou a analisar.',
  em_andamento: 'A solução está em andamento.',
  resolvida: 'Demanda resolvida.',
  recusada: 'A demanda não pôde ser atendida.',
  cancelada: 'Demanda cancelada por você.',
};

export const isFinal = (s: DemandStatus): boolean => STATUS_FLOW[s].length === 0;

/** O autor só pode cancelar enquanto ninguém começou a analisar. */
export const canCancel = (d: Demand): boolean => d.status === 'aberta';

export type DemandFilter = 'todas' | 'abertas' | 'finalizadas';

export function filterDemands(demands: Demand[], filter: DemandFilter): Demand[] {
  const sorted = [...demands].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (filter === 'abertas') return sorted.filter((d) => !isFinal(d.status));
  if (filter === 'finalizadas') return sorted.filter((d) => isFinal(d.status));
  return sorted;
}

/** Protocolo no formato AAAA-NNNN, contando as demandas do mesmo ano. */
export function nextProtocol(demands: Demand[], now: Date): string {
  const year = now.getFullYear();
  const used = demands
    .map((d) => d.protocol)
    .filter((p) => p.startsWith(`${year}-`))
    .map((p) => Number(p.slice(5)))
    .filter((n) => Number.isFinite(n));
  const next = (used.length ? Math.max(...used) : 0) + 1;
  return `${year}-${String(next).padStart(4, '0')}`;
}

export function demandCounts(demands: Demand[]) {
  return {
    open: demands.filter((d) => !isFinal(d.status)).length,
    done: demands.filter((d) => d.status === 'resolvida').length,
    total: demands.length,
  };
}
