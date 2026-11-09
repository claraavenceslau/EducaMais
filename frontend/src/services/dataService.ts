import { buildSeed } from '../data/seed';
import type { AppData, Course, Task, User } from '../types';
import { authenticatedRequest } from './authService';

type TaskInput = Omit<Task, 'id'>;
type CourseInput = Pick<Course, 'title' | 'description' | 'theme' | 'level' | 'status'> & {
  lessons: { id?: string; title: string; minutes: number }[];
};

function taskPayload(task: Task): TaskInput {
  return {
    title: task.title,
    description: task.description,
    subject: task.subject,
    dueDate: task.dueDate,
    done: task.done,
  };
}

const isServerId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

function coursePayload(course: Course): CourseInput {
  return {
    title: course.title,
    description: course.description,
    theme: course.theme,
    level: course.level,
    status: course.status,
    lessons: course.lessons.map((lesson) => ({
      ...(isServerId(lesson.id) ? { id: lesson.id } : {}),
      title: lesson.title,
      minutes: lesson.minutes,
    })),
  };
}

export const dataService = {
  async load(user: User): Promise<AppData> {
    const demoData = buildSeed(user);
    const [taskResult, courseResult, communityResult] = await Promise.all([
      authenticatedRequest<{ tasks: Task[] }>('/tasks'),
      authenticatedRequest<{ courses: Course[] }>('/courses'),
      authenticatedRequest<{ discussions: AppData['discussions'] }>('/community'),
    ]);
    if (user.role === 'professor') {
      return { ...demoData, tasks: taskResult.tasks, courses: courseResult.courses, discussions: communityResult.discussions };
    }

    const gamification = await authenticatedRequest<Pick<AppData, 'progress' | 'ranking' | 'achievements' | 'activity'>>('/gamification');
    return {
      ...demoData,
      tasks: taskResult.tasks,
      courses: courseResult.courses,
      discussions: communityResult.discussions,
      ...gamification,
    };
  },

  async saveTask(task: Task): Promise<Task> {
    const method = isServerId(task.id) ? 'PUT' : 'POST';
    const path = method === 'PUT' ? `/tasks/${encodeURIComponent(task.id)}` : '/tasks';
    const result = await authenticatedRequest<{ task: Task }>(path, {
      method,
      body: JSON.stringify(taskPayload(task)),
    });
    return result.task;
  },

  async toggleTask(id: string): Promise<Task> {
    const result = await authenticatedRequest<{ task: Task }>(`/tasks/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
    });
    return result.task;
  },

  async removeTask(id: string): Promise<void> {
    await authenticatedRequest<void>(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async saveCourse(course: Course): Promise<Course> {
    const method = isServerId(course.id) ? 'PUT' : 'POST';
    const path = method === 'PUT' ? `/courses/${encodeURIComponent(course.id)}` : '/courses';
    const result = await authenticatedRequest<{ course: Course }>(path, {
      method,
      body: JSON.stringify(coursePayload(course)),
    });
    return result.course;
  },

  async enrollCourse(courseId: string): Promise<Course> {
    const result = await authenticatedRequest<{ course: Course }>(`/courses/${encodeURIComponent(courseId)}/enroll`, {
      method: 'POST',
    });
    return result.course;
  },

  async toggleLesson(courseId: string, lessonId: string): Promise<Course> {
    const path = `/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/toggle`;
    const result = await authenticatedRequest<{ course: Course }>(path, { method: 'PATCH' });
    return result.course;
  },

  async addDiscussion(discussion: AppData['discussions'][number]): Promise<AppData['discussions'][number]> {
    const result = await authenticatedRequest<{ discussion: AppData['discussions'][number] }>('/community', {
      method: 'POST',
      body: JSON.stringify({ title: discussion.title, body: discussion.body, subject: discussion.subject }),
    });
    return result.discussion;
  },

  async removeDiscussion(id: string): Promise<void> {
    await authenticatedRequest<void>(`/community/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async addReply(discussionId: string, body: string): Promise<AppData['discussions'][number]> {
    const result = await authenticatedRequest<{ discussion: AppData['discussions'][number] }>(`/community/${encodeURIComponent(discussionId)}/replies`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
    return result.discussion;
  },
};
