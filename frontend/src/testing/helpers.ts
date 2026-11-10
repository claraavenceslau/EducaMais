import { buildSeed } from '../data/seed';
import type { AppData, Course, Task, User } from '../types';

export const NOW = new Date(2026, 10, 9, 10, 0); // segunda-feira, 09/11/2026 10:00

export const STUDENT: User = { id: 'u-aluno', name: 'Ana Souza', email: 'ana@demo.educa', role: 'aluno' };
export const TEACHER: User = { id: 'u-prof', name: 'Carlos Lima', email: 'carlos@demo.educa', role: 'professor' };

export const studentData = (): AppData => buildSeed(STUDENT, NOW);
export const teacherData = (): AppData => buildSeed(TEACHER, NOW);

export const task = (over: Partial<Task> = {}): Task => ({
  id: 't', title: 'Tarefa', description: '', subject: '', dueDate: '2026-11-10', done: false, ...over,
});

export const course = (over: Partial<Course> = {}): Course => ({
  id: 'c', title: 'Curso', description: '', theme: 'Mobile', level: 'Iniciante', teacher: 'Prof',
  lessons: [], enrolled: true, status: 'publicado', students: 0, contentCreated: 100, ...over,
});

export const lessons = (done: boolean[]) =>
  done.map((d, i) => ({ id: `l${i}`, title: `Aula ${i + 1}`, minutes: 10, done: d }));
