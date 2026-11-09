import type {
  AppData, Course, CourseLevel, CourseTheme, Discussion, Task,
} from '../types';
import { daysUntil } from './dates';

export type TaskFilter = 'todas' | 'pendentes' | 'concluidas';

/** Pendentes primeiro, por prazo; concluídas ao final. */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  const sorted = sortTasks(tasks);
  if (filter === 'pendentes') return sorted.filter((t) => !t.done);
  if (filter === 'concluidas') return sorted.filter((t) => t.done);
  return sorted;
}

/** As próximas tarefas pendentes, da mais urgente para a menos urgente. */
export function upcomingTasks(tasks: Task[], limit: number): Task[] {
  return sortTasks(tasks).filter((t) => !t.done).slice(0, limit);
}

export function countOverdue(tasks: Task[], now: Date): number {
  return tasks.filter((t) => !t.done && daysUntil(t.dueDate, now) < 0).length;
}

// ---- Cursos ----

export const COURSE_THEMES: CourseTheme[] = ['Design', 'Mobile', 'Programação', 'Dados', 'Gestão'];
export const COURSE_LEVELS: CourseLevel[] = ['Iniciante', 'Intermediário', 'Avançado'];

/** Percentual de aulas concluídas (0 a 100). */
export function courseProgress(course: Course): number {
  if (course.lessons.length === 0) return 0;
  const done = course.lessons.filter((l) => l.done).length;
  return Math.round((done / course.lessons.length) * 100);
}

export type CourseTab = 'explorar' | 'meus';

export function filterCourses(
  courses: Course[],
  options: { tab: CourseTab; theme?: CourseTheme; level?: CourseLevel },
): Course[] {
  return courses.filter((c) => {
    if (c.status !== 'publicado') return false;
    if (options.tab === 'meus' && !c.enrolled) return false;
    if (options.theme && c.theme !== options.theme) return false;
    if (options.level && c.level !== options.level) return false;
    return true;
  });
}

/** Cursos já iniciados e ainda não terminados. */
export function inProgressCourses(courses: Course[]): Course[] {
  return courses.filter((c) => {
    if (!c.enrolled) return false;
    const p = courseProgress(c);
    return p < 100;
  });
}

/** Texto curto exibido no topo do cartão do curso. */
export function themeBadge(theme: CourseTheme): string {
  switch (theme) {
    case 'Design': return 'UX/UI';
    case 'Mobile': return 'MOBILE';
    case 'Programação': return 'PYTHON';
    case 'Dados': return 'DATA';
    case 'Gestão': return 'GESTÃO';
  }
}

/** Cursos de Design e Programação usam o degradê azul-violeta; os demais, o laranja de acento. */
export function themeTone(theme: CourseTheme): 'gradient' | 'accent' {
  return theme === 'Design' || theme === 'Programação' ? 'gradient' : 'accent';
}

export function teacherStats(courses: Course[]) {
  return {
    activeCourses: courses.filter((c) => c.status === 'publicado').length,
    students: courses.reduce((sum, c) => sum + c.students, 0),
    contents: courses.reduce((sum, c) => sum + c.lessons.length, 0),
  };
}

export function studentStats(data: AppData) {
  return {
    points: data.progress.points,
    tasksDone: data.tasks.filter((t) => t.done).length,
    courses: data.courses.filter((c) => c.enrolled).length,
  };
}

// ---- Comunidade ----

export type DiscussionSort = 'recentes' | 'populares' | 'disciplinas';

export function sortDiscussions(items: Discussion[], mode: DiscussionSort): Discussion[] {
  const copy = [...items];
  if (mode === 'populares') {
    return copy.sort((a, b) => b.replies.length - a.replies.length || b.createdAt.localeCompare(a.createdAt));
  }
  if (mode === 'disciplinas') {
    return copy.sort((a, b) => a.subject.localeCompare(b.subject, 'pt-BR') || b.createdAt.localeCompare(a.createdAt));
  }
  return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** "Ana Souza" vira "AS"; "allan" vira "A". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 1)).toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}
