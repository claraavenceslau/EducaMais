import { describe, expect, it } from '@jest/globals';
import { DATA_VERSION, restore, serialize } from '../utils/persist';
import { DEFAULT_PREFERENCES } from '../types';
import { NOW, studentData, task } from '../testing/helpers';

describe('persistência', () => {
  const seed = studentData();

  it('ida e volta preserva os dados', () => {
    const changed = { ...seed, tasks: [task({ id: 'x', title: 'Salva' })], profile: { name: 'Ana Maria' } };
    const back = restore(serialize(changed, NOW), seed);
    expect(back.tasks).toEqual(changed.tasks);
    expect(back.profile.name).toBe('Ana Maria');
  });
  it('sem nada salvo, devolve os dados iniciais', () => {
    expect(restore(null, seed)).toBe(seed);
    expect(restore(undefined, seed)).toBe(seed);
    expect(restore('', seed)).toBe(seed);
  });
  it('texto corrompido ou versão diferente é ignorado', () => {
    expect(restore('{nao é json', seed)).toBe(seed);
    expect(restore(JSON.stringify({ version: DATA_VERSION + 1, data: { tasks: [] } }), seed)).toBe(seed);
    expect(restore(JSON.stringify([1, 2]), seed)).toBe(seed);
    expect(restore(JSON.stringify({ version: DATA_VERSION, data: 'x' }), seed)).toBe(seed);
  });
  it('campo com tipo errado volta ao valor inicial; os demais continuam', () => {
    const raw = JSON.stringify({ version: DATA_VERSION, savedAt: '', data: { tasks: 'quebrado', demands: [] } });
    const back = restore(raw, seed);
    expect(back.tasks).toEqual(seed.tasks);
    expect(back.demands).toEqual([]);
  });
  it('campos novos ausentes no que foi salvo recebem o valor inicial', () => {
    const raw = JSON.stringify({ version: DATA_VERSION, savedAt: '', data: { tasks: [] } });
    const back = restore(raw, seed);
    expect(back.notices).toEqual(seed.notices);
    expect(back.preferences).toEqual(DEFAULT_PREFERENCES);
  });
  it('preferências antigas incompletas são completadas com os padrões', () => {
    const raw = JSON.stringify({ version: DATA_VERSION, savedAt: '', data: { preferences: { notifications: { tasks: true } } } });
    const back = restore(raw, seed);
    expect(back.preferences.notifications).toEqual({ ...DEFAULT_PREFERENCES.notifications, tasks: true });
    expect(back.preferences.privacy).toEqual(DEFAULT_PREFERENCES.privacy);
  });
});

describe('dados de demonstração', () => {
  it('aluno tem tarefas, cursos, avisos e demandas; professor tem cursos próprios', () => {
    const s = studentData();
    expect(s.tasks).toHaveLength(3);
    expect(s.courses).toHaveLength(4);
    expect(s.notices.some((n) => !n.read)).toBe(true);
    expect(s.demands.length).toBeGreaterThan(0);
  });
  it('toda demanda tem uma linha do tempo cujo último evento é o status atual', () => {
    for (const d of studentData().demands) expect(d.timeline[d.timeline.length - 1].status).toBe(d.status);
  });
  it('toda avaliação aponta para um curso existente', () => {
    const s = studentData();
    const ids = new Set(s.courses.map((c) => c.id));
    expect(s.reviews.every((r) => ids.has(r.courseId))).toBe(true);
  });
});
