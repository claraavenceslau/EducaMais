import { describe, expect, it } from '@jest/globals';
import { reduceData } from '../context/dataReducer';
import type { Appointment, Demand, Review } from '../types';
import { studentData, task } from '../testing/helpers';

const base = () => studentData();

describe('tarefas', () => {
  it('task/save cria no início e edita pelo mesmo id', () => {
    const s0 = base();
    const created = reduceData(s0, { type: 'task/save', task: task({ id: 'novo', title: 'Nova' }) });
    expect(created.tasks[0].id).toBe('novo');
    expect(created.tasks).toHaveLength(s0.tasks.length + 1);
    const edited = reduceData(created, { type: 'task/save', task: task({ id: 'novo', title: 'Editada' }) });
    expect(edited.tasks).toHaveLength(created.tasks.length);
    expect(edited.tasks.find((t) => t.id === 'novo')?.title).toBe('Editada');
  });
  it('task/toggle alterna e task/remove apaga', () => {
    const s0 = base();
    const id = s0.tasks[0].id;
    const toggled = reduceData(s0, { type: 'task/toggle', id });
    expect(toggled.tasks[0].done).toBe(!s0.tasks[0].done);
    expect(reduceData(toggled, { type: 'task/remove', id }).tasks.find((t) => t.id === id)).toBeUndefined();
  });
  it('não altera o estado anterior', () => {
    const s0 = base();
    const copy = JSON.stringify(s0);
    reduceData(s0, { type: 'task/toggle', id: s0.tasks[0].id });
    expect(JSON.stringify(s0)).toBe(copy);
  });
});

describe('cursos', () => {
  it('enroll matricula', () => {
    const s0 = base();
    expect(s0.courses.find((c) => c.id === 'c3')?.enrolled).toBe(false);
    expect(reduceData(s0, { type: 'course/enroll', id: 'c3' }).courses.find((c) => c.id === 'c3')?.enrolled).toBe(true);
  });
  it('toggleLesson só funciona para curso matriculado', () => {
    const s0 = base();
    const notEnrolled = reduceData(s0, { type: 'course/toggleLesson', courseId: 'c3', lessonId: 'c3-l1' });
    expect(notEnrolled.courses.find((c) => c.id === 'c3')?.lessons[0].done).toBe(false);
    const enrolled = reduceData(s0, { type: 'course/toggleLesson', courseId: 'c1', lessonId: 'c1-l4' });
    expect(enrolled.courses.find((c) => c.id === 'c1')?.lessons[3].done).toBe(true);
  });
});

describe('discussões', () => {
  it('adiciona, responde e remove', () => {
    const s0 = base();
    const d = { id: 'dx', author: 'Ana', title: 'T', body: 'B', subject: 'Geral', createdAt: '2026-11-09T10:00:00Z', replies: [] };
    const s1 = reduceData(s0, { type: 'discussion/add', discussion: d });
    expect(s1.discussions[0].id).toBe('dx');
    const s2 = reduceData(s1, { type: 'reply/add', discussionId: 'dx', reply: { id: 'r', author: 'Ana', body: 'oi', createdAt: d.createdAt } });
    expect(s2.discussions[0].replies).toHaveLength(1);
    expect(reduceData(s2, { type: 'discussion/remove', id: 'dx' }).discussions.find((x) => x.id === 'dx')).toBeUndefined();
  });
});

describe('avaliações', () => {
  const review = (over: Partial<Review> = {}): Review => ({
    id: 'r1', courseId: 'c3', studentId: 'u1', authorName: 'Ana', anonymous: false, stars: 4,
    createdAt: '2026-11-09T10:00:00Z', updatedAt: '2026-11-09T10:00:00Z', ...over,
  });
  it('salva a primeira avaliação', () => {
    const s = reduceData(base(), { type: 'review/save', review: review() });
    expect(s.reviews.filter((r) => r.studentId === 'u1')).toHaveLength(1);
  });
  it('a segunda avaliação do mesmo aluno no mesmo curso edita a primeira', () => {
    const s1 = reduceData(base(), { type: 'review/save', review: review() });
    const s2 = reduceData(s1, { type: 'review/save', review: review({ id: 'outro', stars: 2, updatedAt: '2026-11-10T10:00:00Z' }) });
    const mine = s2.reviews.filter((r) => r.studentId === 'u1' && r.courseId === 'c3');
    expect(mine).toHaveLength(1);
    expect(mine[0].stars).toBe(2);
    expect(mine[0].id).toBe('r1'); // mantém o id original
    expect(mine[0].createdAt).toBe('2026-11-09T10:00:00Z'); // mantém a criação
  });
  it('alunos diferentes avaliam o mesmo curso', () => {
    const s1 = reduceData(base(), { type: 'review/save', review: review() });
    const s2 = reduceData(s1, { type: 'review/save', review: review({ id: 'r2', studentId: 'u2' }) });
    expect(s2.reviews.length).toBe(s1.reviews.length + 1);
  });
  it('remove', () => {
    const s1 = reduceData(base(), { type: 'review/save', review: review() });
    expect(reduceData(s1, { type: 'review/remove', id: 'r1' }).reviews.find((r) => r.id === 'r1')).toBeUndefined();
  });
});

describe('demandas', () => {
  const demand: Demand = {
    id: 'dm9', protocol: '2026-0009', category: 'outros', title: 'Teste', description: 'x'.repeat(20), status: 'aberta',
    createdAt: '2026-11-09T10:00:00Z', updatedAt: '2026-11-09T10:00:00Z', attachments: [],
    timeline: [{ id: 'e1', status: 'aberta', text: 'Registrada', at: '2026-11-09T10:00:00Z' }],
  };
  it('adiciona no início e registra eventos', () => {
    const s1 = reduceData(base(), { type: 'demand/add', demand });
    expect(s1.demands[0].id).toBe('dm9');
    const at = '2026-11-10T09:00:00Z';
    const s2 = reduceData(s1, { type: 'demand/event', id: 'dm9', event: { id: 'e2', status: 'em_analise', text: 'Analisando', at } });
    const d = s2.demands.find((x) => x.id === 'dm9')!;
    expect(d.status).toBe('em_analise');
    expect(d.updatedAt).toBe(at);
    expect(d.timeline).toHaveLength(2);
  });
});

describe('avisos, agendamentos, preferências e perfil', () => {
  it('lê um aviso e todos', () => {
    const s0 = base();
    const first = s0.notices.find((n) => !n.read)!;
    const s1 = reduceData(s0, { type: 'notice/read', id: first.id });
    expect(s1.notices.find((n) => n.id === first.id)?.read).toBe(true);
    expect(reduceData(s1, { type: 'notice/readAll' }).notices.every((n) => n.read)).toBe(true);
  });
  it('salva e cancela agendamento (limpa o lembrete)', () => {
    const a: Appointment = { id: 'ap1', service: 'secretaria', date: '2026-11-10', time: '09:00', reason: 'Declaração', status: 'agendado', createdAt: '2026-11-09T10:00:00Z', reminderId: 'rem' };
    const s1 = reduceData(base(), { type: 'appointment/save', appointment: a });
    expect(s1.appointments).toHaveLength(1);
    const s2 = reduceData(s1, { type: 'appointment/cancel', id: 'ap1' });
    expect(s2.appointments[0].status).toBe('cancelado');
    expect(s2.appointments[0].reminderId).toBeUndefined();
  });
  it('prefs/set muda só o campo informado', () => {
    const s0 = base();
    const s1 = reduceData(s0, { type: 'prefs/set', patch: { notifications: { tasks: true } } });
    expect(s1.preferences.notifications.tasks).toBe(true);
    expect(s1.preferences.notifications.notices).toBe(s0.preferences.notifications.notices);
    expect(s1.preferences.privacy).toEqual(s0.preferences.privacy);
  });
  it('profile/save', () => {
    expect(reduceData(base(), { type: 'profile/save', profile: { name: 'Novo Nome' } }).profile.name).toBe('Novo Nome');
  });
  it('loaded substitui tudo', () => {
    const s0 = base();
    expect(reduceData(s0, { type: 'loaded', data: { ...s0, tasks: [] } }).tasks).toEqual([]);
  });
});
