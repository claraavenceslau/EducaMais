import type {
  Appointment, AppData, Course, Demand, DemandEvent, Discussion, Preferences, Profile, Reply, Review, Task,
} from '../types';

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
  | { type: 'reply/add'; discussionId: string; reply: Reply }
  | { type: 'review/save'; review: Review }
  | { type: 'review/remove'; id: string }
  | { type: 'demand/add'; demand: Demand }
  | { type: 'demand/event'; id: string; event: DemandEvent }
  | { type: 'notice/read'; id: string }
  | { type: 'notice/readAll' }
  | { type: 'appointment/save'; appointment: Appointment }
  | { type: 'appointment/cancel'; id: string }
  | { type: 'prefs/set'; patch: DeepPartialPrefs }
  | { type: 'profile/save'; profile: Profile };

export type DeepPartialPrefs = {
  notifications?: Partial<Preferences['notifications']>;
  privacy?: Partial<Preferences['privacy']>;
};

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

    case 'review/save': {
      // Uma avaliação por aluno em cada curso: se já existe, é editada.
      const { review } = action;
      const same = (r: Review) => r.courseId === review.courseId && r.studentId === review.studentId;
      return {
        ...state,
        reviews: state.reviews.some(same)
          ? state.reviews.map((r) => (same(r) ? { ...review, id: r.id, createdAt: r.createdAt } : r))
          : [review, ...state.reviews],
      };
    }
    case 'review/remove':
      return { ...state, reviews: state.reviews.filter((r) => r.id !== action.id) };

    case 'demand/add':
      return { ...state, demands: [action.demand, ...state.demands] };
    case 'demand/event':
      return {
        ...state,
        demands: state.demands.map((d) =>
          d.id === action.id
            ? { ...d, status: action.event.status, updatedAt: action.event.at, timeline: [...d.timeline, action.event] }
            : d,
        ),
      };

    case 'notice/read':
      return { ...state, notices: state.notices.map((n) => (n.id === action.id ? { ...n, read: true } : n)) };
    case 'notice/readAll':
      return { ...state, notices: state.notices.map((n) => ({ ...n, read: true })) };

    case 'appointment/save':
      return { ...state, appointments: upsert(state.appointments, action.appointment) };
    case 'appointment/cancel':
      return {
        ...state,
        appointments: state.appointments.map((a) =>
          a.id === action.id ? { ...a, status: 'cancelado', reminderId: undefined } : a,
        ),
      };

    case 'prefs/set':
      return {
        ...state,
        preferences: {
          notifications: { ...state.preferences.notifications, ...action.patch.notifications },
          privacy: { ...state.preferences.privacy, ...action.patch.privacy },
        },
      };
    case 'profile/save':
      return { ...state, profile: action.profile };
  }
}
