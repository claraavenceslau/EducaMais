import { describe, expect, it } from '@jest/globals';
import {
  ALLOWED_DOCUMENT_TYPES, formatBytes, kindFromMime, MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS, validateAttachment,
} from '../utils/attachments';
import {
  bookableDays, isWeekday, MAX_ACTIVE_APPOINTMENTS, reminderDate, slotsForDay, upcoming, history, validateBooking,
} from '../utils/appointments';
import { canCancel, demandCounts, filterDemands, isFinal, nextProtocol, STATUS_FLOW } from '../utils/demands';
import { formatCoords, hasCoords, joinAddress, manualLocation, mapsUrl } from '../utils/location';
import { filterNotices, sortNotices, unreadCount } from '../utils/notices';
import { courseRating, MIN_PROGRESS_TO_REVIEW, myReview, ratingLabel, reviewEligibility, summarize } from '../utils/reviews';
import type { Appointment, Attachment, Demand, Notice, Review } from '../types';
import { course, lessons, NOW } from '../testing/helpers';

describe('anexos', () => {
  const file = (over: Partial<Attachment> = {}): Attachment => ({ id: 'a', kind: 'image', name: 'foto.jpg', uri: 'file://1', mimeType: 'image/jpeg', sizeBytes: 1000, ...over });
  it('formata tamanhos', () => {
    expect(formatBytes(undefined)).toBe('tamanho desconhecido');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(1.5 * 1024 * 1024)).toBe('1,5 MB');
  });
  it('kindFromMime', () => {
    expect(kindFromMime('image/png')).toBe('image');
    expect(kindFromMime('application/pdf')).toBe('document');
    expect(kindFromMime(undefined)).toBe('document');
  });
  it('aceita arquivo válido', () => {
    expect(validateAttachment(file(), [])).toBeUndefined();
  });
  it('recusa arquivo grande demais', () => {
    expect(validateAttachment(file({ sizeBytes: MAX_ATTACHMENT_BYTES + 1 }), [])).toMatch(/limite/);
    expect(validateAttachment(file({ sizeBytes: MAX_ATTACHMENT_BYTES }), [])).toBeUndefined();
  });
  it('recusa passar do máximo e arquivo repetido', () => {
    const full = Array.from({ length: MAX_ATTACHMENTS }, (_, i) => file({ id: String(i), uri: `file://${i}` }));
    expect(validateAttachment(file({ uri: 'file://novo' }), full)).toMatch(/até/);
    expect(validateAttachment(file({ uri: 'file://0' }), [full[0]])).toMatch(/já foi anexado/);
  });
  it('recusa tipo de documento fora da lista', () => {
    expect(validateAttachment(file({ kind: 'document', mimeType: 'application/zip' }), [])).toBeDefined();
    expect(validateAttachment(file({ kind: 'document', mimeType: ALLOWED_DOCUMENT_TYPES[0] }), [])).toBeUndefined();
  });
});

describe('localização', () => {
  it('formatação e link', () => {
    expect(formatCoords(-8.047562, -34.877)).toBe('-8.04756, -34.87700');
    expect(mapsUrl(-8.05, -34.88)).toContain('query=-8.05,-34.88');
  });
  it('hasCoords e manualLocation', () => {
    expect(hasCoords(undefined)).toBe(false);
    expect(hasCoords(manualLocation('  Sala 3 '))).toBe(false);
    expect(manualLocation('  Sala 3 ').description).toBe('Sala 3');
    expect(hasCoords({ source: 'gps', description: 'x', latitude: 1, longitude: 2 })).toBe(true);
  });
  it('joinAddress ignora partes vazias', () => {
    expect(joinAddress(['Rua A, 10', '', null, 'Recife'])).toBe('Rua A, 10, Recife');
  });
});

describe('demandas', () => {
  const dm = (over: Partial<Demand> = {}): Demand => ({
    id: 'd', protocol: '2026-0001', category: 'outros', title: 't', description: 'd', status: 'aberta',
    createdAt: '2026-11-01T10:00:00Z', updatedAt: '2026-11-01T10:00:00Z', attachments: [], timeline: [], ...over,
  });
  it('protocolo sequencial por ano', () => {
    expect(nextProtocol([], NOW)).toBe('2026-0001');
    expect(nextProtocol([dm({ protocol: '2026-0007' }), dm({ protocol: '2026-0003' })], NOW)).toBe('2026-0008');
    expect(nextProtocol([dm({ protocol: '2025-0099' })], NOW)).toBe('2026-0001');
  });
  it('status finais e cancelamento', () => {
    expect(isFinal('resolvida')).toBe(true);
    expect(isFinal('aberta')).toBe(false);
    expect(canCancel(dm({ status: 'aberta' }))).toBe(true);
    expect(canCancel(dm({ status: 'em_analise' }))).toBe(false);
  });
  it('fluxo de status não tem ciclos e termina em estados finais', () => {
    const visit = (s: keyof typeof STATUS_FLOW, seen: string[] = []): void => {
      expect(seen).not.toContain(s);
      STATUS_FLOW[s].forEach((n) => visit(n, [...seen, s]));
    };
    visit('aberta');
  });
  it('filtros e contagens', () => {
    const list = [
      dm({ id: '1', status: 'aberta', createdAt: '2026-11-01T10:00:00Z' }),
      dm({ id: '2', status: 'resolvida', createdAt: '2026-11-03T10:00:00Z' }),
      dm({ id: '3', status: 'cancelada', createdAt: '2026-11-02T10:00:00Z' }),
    ];
    expect(filterDemands(list, 'todas').map((d) => d.id)).toEqual(['2', '3', '1']);
    expect(filterDemands(list, 'abertas').map((d) => d.id)).toEqual(['1']);
    expect(filterDemands(list, 'finalizadas').map((d) => d.id)).toEqual(['2', '3']);
    expect(demandCounts(list)).toEqual({ open: 1, done: 1, total: 3 });
  });
});

describe('agendamento', () => {
  const ap = (over: Partial<Appointment> = {}): Appointment => ({
    id: 'a', service: 'secretaria', date: '2026-11-10', time: '09:00', reason: 'x', status: 'agendado', createdAt: NOW.toISOString(), ...over,
  });
  it('dias úteis', () => {
    expect(isWeekday('2026-11-09')).toBe(true); // segunda
    expect(isWeekday('2026-11-14')).toBe(false); // sábado
    expect(isWeekday('2026-11-15')).toBe(false); // domingo
  });
  it('bookableDays pula fins de semana e começa hoje', () => {
    const days = bookableDays(NOW, 6);
    expect(days[0]).toBe('2026-11-09');
    expect(days).toHaveLength(6);
    expect(days.every(isWeekday)).toBe(true);
    expect(days[5]).toBe('2026-11-16');
  });
  it('horários de hoje com menos de 1 hora de antecedência não ficam disponíveis', () => {
    const slots = slotsForDay('2026-11-09', 'secretaria', [], NOW); // são 10:00
    expect(slots.find((s) => s.time === '10:30')).toMatchObject({ available: false, reason: 'passou' });
    expect(slots.find((s) => s.time === '08:00')).toMatchObject({ available: false, reason: 'passou' });
  });
  it('o resultado de horários ocupados é estável', () => {
    expect(slotsForDay('2026-11-12', 'direcao', [], NOW)).toEqual(slotsForDay('2026-11-12', 'direcao', [], NOW));
  });
  it('horário já marcado pelo usuário aparece como "voce"', () => {
    const free = slotsForDay('2026-11-12', 'secretaria', [], NOW).find((s) => s.available)!;
    const mine = ap({ date: '2026-11-12', time: free.time });
    expect(slotsForDay('2026-11-12', 'secretaria', [mine], NOW).find((s) => s.time === free.time)?.reason).toBe('voce');
  });
  it('validateBooking cobre campos faltando, limite e horário válido', () => {
    expect(validateBooking(undefined, undefined, undefined, [], NOW)).toMatch(/atendimento/);
    expect(validateBooking('2026-11-12', undefined, 'secretaria', [], NOW)).toMatch(/horário/);
    const free = slotsForDay('2026-11-12', 'secretaria', [], NOW).find((s) => s.available)!;
    expect(validateBooking('2026-11-12', free.time, 'secretaria', [], NOW)).toBeUndefined();
    const many = Array.from({ length: MAX_ACTIVE_APPOINTMENTS }, (_, i) => ap({ id: String(i), date: '2026-11-20', time: '08:00' }));
    expect(validateBooking('2026-11-12', free.time, 'secretaria', many, NOW)).toMatch(/já tem/);
    expect(validateBooking('2026-11-09', '10:30', 'secretaria', [], NOW)).toMatch(/disponível/);
  });
  it('próximos e histórico', () => {
    const list = [
      ap({ id: '1', date: '2026-11-12' }),
      ap({ id: '2', date: '2026-11-10' }),
      ap({ id: '3', date: '2026-11-11', status: 'cancelado' }),
      ap({ id: '4', date: '2026-11-01' }),
    ];
    expect(upcoming(list, NOW).map((a) => a.id)).toEqual(['2', '1']);
    expect(history(list, NOW).map((a) => a.id)).toEqual(['3', '4']);
  });
  it('lembrete 1 hora antes', () => {
    expect(reminderDate(ap({ date: '2026-11-10', time: '09:00' })).getTime()).toBe(new Date(2026, 10, 10, 8, 0).getTime());
  });
});

describe('avisos', () => {
  const n = (over: Partial<Notice>): Notice => ({
    id: 'n', title: 't', body: 'b', category: 'geral', publishedAt: '2026-11-01T10:00:00Z', author: 'x', read: false, ...over,
  });
  it('urgente não lido sobe ao topo, o resto por data', () => {
    const list = [
      n({ id: 'a', publishedAt: '2026-11-05T10:00:00Z' }),
      n({ id: 'b', publishedAt: '2026-11-01T10:00:00Z', category: 'urgente' }),
      n({ id: 'c', publishedAt: '2026-11-07T10:00:00Z' }),
      n({ id: 'd', publishedAt: '2026-11-09T10:00:00Z', category: 'urgente', read: true }),
    ];
    expect(sortNotices(list).map((x) => x.id)).toEqual(['b', 'd', 'c', 'a']);
    expect(filterNotices(list, 'urgente').map((x) => x.id)).toEqual(['b', 'd']);
    expect(unreadCount(list)).toBe(3);
  });
});

describe('avaliações de cursos', () => {
  const rv = (stars: 1 | 2 | 3 | 4 | 5, over: Partial<Review> = {}): Review => ({
    id: `r${Math.random()}`, courseId: 'c', studentId: 's', authorName: 'x', anonymous: false, stars,
    createdAt: '2026-11-01T10:00:00Z', updatedAt: '2026-11-01T10:00:00Z', ...over,
  });
  it('média arredondada a uma casa e distribuição', () => {
    const s = summarize([rv(5), rv(5), rv(4)]);
    expect(s.average).toBe(4.7);
    expect(s.count).toBe(3);
    expect(s.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 2 });
  });
  it('sem avaliações', () => {
    expect(summarize([])).toMatchObject({ average: 0, count: 0 });
    expect(ratingLabel(summarize([]))).toBe('Novo');
    expect(ratingLabel(summarize([rv(5), rv(4)]))).toBe('4,5 (2)');
  });
  it('courseRating e myReview filtram por curso e aluno', () => {
    const list = [rv(5, { courseId: 'a', studentId: 'u1' }), rv(1, { courseId: 'b', studentId: 'u1' }), rv(3, { courseId: 'a', studentId: 'u2' })];
    expect(courseRating(list, 'a').average).toBe(4);
    expect(myReview(list, 'b', 'u1')?.stars).toBe(1);
    expect(myReview(list, 'b', 'u2')).toBeUndefined();
  });
  it('quem pode avaliar', () => {
    const ok = course({ lessons: lessons([true, false, false, false]) }); // 25%
    expect(reviewEligibility(ok, 'aluno').allowed).toBe(true);
    expect(reviewEligibility(course({ lessons: lessons([false, false, false, false]) }), 'aluno').reason).toContain(`${MIN_PROGRESS_TO_REVIEW}%`);
    expect(reviewEligibility(course({ enrolled: false }), 'aluno').allowed).toBe(false);
    expect(reviewEligibility(ok, 'professor').allowed).toBe(false);
  });
});
