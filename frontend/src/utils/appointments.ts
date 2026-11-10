import type { Appointment, ServiceKey } from '../types';
import { addDays } from './dates';

export const SERVICES: { key: ServiceKey; label: string; description: string }[] = [
  { key: 'secretaria', label: 'Secretaria', description: 'Documentos, matrícula, declarações' },
  { key: 'coordenacao', label: 'Coordenação pedagógica', description: 'Dúvidas sobre notas e aulas' },
  { key: 'direcao', label: 'Direção', description: 'Assuntos gerais da escola' },
  { key: 'orientacao', label: 'Orientação educacional', description: 'Apoio ao estudante e à família' },
];

export const serviceLabel = (key: ServiceKey): string => SERVICES.find((s) => s.key === key)?.label ?? key;

// Atendimento de segunda a sexta, em blocos de 30 minutos.
export const SLOT_TIMES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

export const MAX_ACTIVE_APPOINTMENTS = 3;
export const MIN_ADVANCE_MINUTES = 60; // horários muito próximos não podem mais ser marcados

export const isWeekday = (iso: string): boolean => {
  const [y, m, d] = iso.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day !== 0 && day !== 6;
};

/** Próximos dias úteis (hoje incluído), até `count` dias. */
export function bookableDays(now: Date, count = 10): string[] {
  const days: string[] = [];
  for (let i = 0; days.length < count && i < count * 3; i++) {
    const iso = addDays(now, i);
    if (isWeekday(iso)) days.push(iso);
  }
  return days;
}

/** Data e hora de início do atendimento. */
export function appointmentStart(a: Pick<Appointment, 'date' | 'time'>): Date {
  const [y, m, d] = a.date.split('-').map(Number);
  const [h, min] = a.time.split(':').map(Number);
  return new Date(y, m - 1, d, h, min);
}

export const reminderDate = (a: Pick<Appointment, 'date' | 'time'>): Date =>
  new Date(appointmentStart(a).getTime() - 60 * 60_000);

export const isActive = (a: Appointment): boolean => a.status === 'agendado';

// Simula horários já ocupados por outras pessoas. Sempre dá o mesmo resultado para
// a mesma data, hora e serviço (não muda a cada abertura da tela).
function takenByOthers(date: string, time: string, service: ServiceKey): boolean {
  const text = `${date}|${time}|${service}`;
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) % 9973;
  return hash % 5 === 0;
}

export type Slot = { time: string; available: boolean; reason?: 'passou' | 'ocupado' | 'voce' };

export function slotsForDay(date: string, service: ServiceKey, appointments: Appointment[], now: Date): Slot[] {
  const limit = now.getTime() + MIN_ADVANCE_MINUTES * 60_000;
  return SLOT_TIMES.map((time) => {
    if (appointmentStart({ date, time }).getTime() < limit) return { time, available: false, reason: 'passou' as const };
    if (appointments.some((a) => isActive(a) && a.date === date && a.time === time)) {
      return { time, available: false, reason: 'voce' as const };
    }
    if (takenByOthers(date, time, service)) return { time, available: false, reason: 'ocupado' as const };
    return { time, available: true };
  });
}

export function validateBooking(
  date: string | undefined,
  time: string | undefined,
  service: ServiceKey | undefined,
  appointments: Appointment[],
  now: Date,
): string | undefined {
  if (!service) return 'Escolha o tipo de atendimento.';
  if (!date) return 'Escolha uma data.';
  if (!time) return 'Escolha um horário.';
  if (appointments.filter(isActive).length >= MAX_ACTIVE_APPOINTMENTS) {
    return `Você já tem ${MAX_ACTIVE_APPOINTMENTS} atendimentos agendados. Cancele um para marcar outro.`;
  }
  const slot = slotsForDay(date, service, appointments, now).find((s) => s.time === time);
  if (!slot || !slot.available) return 'Este horário não está mais disponível. Escolha outro.';
  return undefined;
}

export function upcoming(list: Appointment[], now: Date): Appointment[] {
  return list
    .filter((a) => isActive(a) && appointmentStart(a).getTime() >= now.getTime())
    .sort((a, b) => appointmentStart(a).getTime() - appointmentStart(b).getTime());
}

export function history(list: Appointment[], now: Date): Appointment[] {
  return list
    .filter((a) => !upcoming([a], now).length)
    .sort((a, b) => appointmentStart(b).getTime() - appointmentStart(a).getTime());
}

