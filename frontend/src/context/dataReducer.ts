import type { AppData, Course, Discussion, Reply, Task } from '../types';

export type DataAction =
  | { type: 'loaded'; data: AppData }
  | { type: 'task/save'; task: Task }
  | { type: 'task/toggle'; id: string }
  | { type: 'task/remove'; id: string }
  | { type: 'course/enroll'; id: string }
  | { type: 'course/toggleLesson'; courseId: string; lessonId: string }
  | { type: 'course/save'; course: Course }
  | { type: 'discussion/add'; discussion: Discussion }
  | { type: 'discussion/remove'; id: string }
  | { type: 'reply/add'; discussionId: string; reply: Reply };

/** Insere o item no início da lista ou substitui o que tiver o mesmo id. */
function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id)
    ? list.map((x) => (x.id === item.id ? item : x))
    : [item, ...list];
}

export function reduceData(state: AppData, action: DataAction): AppData {
  switch (action.type) {
    case 'loaded':
      return action.data;

    case 'task/save':
      return { ...state, tasks: upsert(state.tasks, action.task) };
    case 'task/toggle':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)),
      };
    case 'task/remove':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };

    case 'course/enroll':
      return {
        ...state,
        courses: state.courses.map((c) => (c.id === action.id ? { ...c, enrolled: true } : c)),
      };
    case 'course/toggleLesson':
      return {
        ...state,
        courses: state.courses.map((c) =>
          c.id !== action.courseId || !c.enrolled
            ? c
            : {
                ...c,
                lessons: c.lessons.map((l) => (l.id === action.lessonId ? { ...l, done: !l.done } : l)),
              },
        ),
      };
    case 'course/save':
      return { ...state, courses: upsert(state.courses, action.course) };

    case 'discussion/add':
      return { ...state, discussions: [action.discussion, ...state.discussions] };
    case 'discussion/remove':
      return { ...state, discussions: state.discussions.filter((d) => d.id !== action.id) };
    case 'reply/add':
      return {
        ...state,
        discussions: state.discussions.map((d) =>
          d.id === action.discussionId ? { ...d, replies: [...d.replies, action.reply] } : d,
        ),
      };
  }
}
