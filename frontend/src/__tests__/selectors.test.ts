import { describe, expect, it } from '@jest/globals';
import {
  countOverdue, courseProgress, filterCourses, filterTasks, firstName, initials, inProgressCourses,
  sortDiscussions, sortTasks, studentStats, teacherStats, upcomingTasks,
} from '../utils/selectors';
import type { Discussion } from '../types';
import { course, lessons, NOW, studentData, task, teacherData } from '../testing/helpers';

describe('tarefas', () => {
  const list = [
    task({ id: 'a', dueDate: '2026-11-20' }),
    task({ id: 'b', dueDate: '2026-11-10', done: true }),
    task({ id: 'c', dueDate: '2026-11-12' }),
  ];
  it('sortTasks põe pendentes antes, por prazo', () => {
    expect(sortTasks(list).map((t) => t.id)).toEqual(['c', 'a', 'b']);
  });
  it('não altera a lista original', () => {
    sortTasks(list);
    expect(list.map((t) => t.id)).toEqual(['a', 'b', 'c']);
  });
  it('filterTasks', () => {
    expect(filterTasks(list, 'pendentes').map((t) => t.id)).toEqual(['c', 'a']);
    expect(filterTasks(list, 'concluidas').map((t) => t.id)).toEqual(['b']);
    expect(filterTasks(list, 'todas')).toHaveLength(3);
  });
  it('upcomingTasks respeita o limite', () => {
    expect(upcomingTasks(list, 1).map((t) => t.id)).toEqual(['c']);
  });
  it('countOverdue ignora concluídas', () => {
    const l = [task({ dueDate: '2026-11-01' }), task({ dueDate: '2026-11-01', done: true }), task({ dueDate: '2026-11-09' })];
    expect(countOverdue(l, NOW)).toBe(1);
  });
});

describe('cursos', () => {
  it('courseProgress', () => {
    expect(courseProgress(course({ lessons: [] }))).toBe(0);
    expect(courseProgress(course({ lessons: lessons([true, false, false, false]) }))).toBe(25);
    expect(courseProgress(course({ lessons: lessons([true, true, true]) }))).toBe(100);
  });
  it('filterCourses esconde rascunhos e aplica abas e filtros', () => {
    const cs = [
      course({ id: '1', enrolled: true }),
      course({ id: '2', enrolled: false, theme: 'Dados' }),
      course({ id: '3', status: 'rascunho' }),
    ];
    expect(filterCourses(cs, { tab: 'explorar' }).map((c) => c.id)).toEqual(['1', '2']);
    expect(filterCourses(cs, { tab: 'meus' }).map((c) => c.id)).toEqual(['1']);
    expect(filterCourses(cs, { tab: 'explorar', theme: 'Dados' }).map((c) => c.id)).toEqual(['2']);
  });
  it('inProgressCourses exclui matriculas concluídas e não matriculados', () => {
    const cs = [
      course({ id: 'a', lessons: lessons([true, false]) }),
      course({ id: 'b', lessons: lessons([true, true]) }),
      course({ id: 'c', enrolled: false, lessons: lessons([false]) }),
    ];
    expect(inProgressCourses(cs).map((c) => c.id)).toEqual(['a']);
  });
});

describe('estatísticas', () => {
  it('teacherStats soma dos cursos do professor', () => {
    const s = teacherStats(teacherData().courses);
    expect(s).toEqual({ activeCourses: 2, students: 56, contents: 8 });
  });
  it('studentStats vem dos dados', () => {
    const s = studentStats(studentData());
    expect(s.points).toBe(250);
    expect(s.tasksDone).toBe(1);
    expect(s.courses).toBe(3);
  });
});

describe('comunidade e nomes', () => {
  const d = (id: string, subject: string, createdAt: string, replies: number): Discussion => ({
    id, subject, createdAt, title: id, body: '', author: 'x',
    replies: Array.from({ length: replies }, (_, i) => ({ id: `${id}${i}`, author: 'y', body: '', createdAt })),
  });
  const list = [d('a', 'Mobile', '2026-11-01T10:00:00Z', 1), d('b', 'Design', '2026-11-02T10:00:00Z', 3), d('c', 'Mobile', '2026-11-03T10:00:00Z', 0)];
  it('ordenações', () => {
    expect(sortDiscussions(list, 'recentes').map((x) => x.id)).toEqual(['c', 'b', 'a']);
    expect(sortDiscussions(list, 'populares').map((x) => x.id)).toEqual(['b', 'a', 'c']);
    expect(sortDiscussions(list, 'disciplinas').map((x) => x.id)).toEqual(['b', 'c', 'a']);
  });
  it('initials e firstName', () => {
    expect(initials('Ana Souza')).toBe('AS');
    expect(initials('allan')).toBe('A');
    expect(initials('  ')).toBe('?');
    expect(firstName('Ana Maria Souza')).toBe('Ana');
  });
});
