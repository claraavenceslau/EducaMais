import {
  createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer, useState,
} from 'react';
import { dataService } from '../services/dataService';
import { EMPTY_DATA } from '../types';
import type { AppData, Course, Discussion, Reply, Task, User } from '../types';
import { reduceData } from './dataReducer';

export type LoadStatus = 'loading' | 'ready' | 'error';

type DataValue = {
  status: LoadStatus;
  mutationError: string | null;
  data: AppData;
  reload: () => void;
  clearMutationError: () => void;
  actions: {
    saveTask: (task: Task) => Promise<Task>;
    toggleTask: (id: string) => Promise<Task>;
    removeTask: (id: string) => Promise<void>;
    enroll: (courseId: string) => Promise<Course>;
    toggleLesson: (courseId: string, lessonId: string) => Promise<Course>;
    saveCourse: (course: Course) => Promise<Course>;
    addDiscussion: (discussion: Discussion) => Promise<void>;
    removeDiscussion: (id: string) => Promise<void>;
    addReply: (discussionId: string, reply: Reply) => Promise<void>;
  };
};

const DataContext = createContext<DataValue | undefined>(undefined);

export function DataProvider({ user, children }: { user: User; children: ReactNode }) {
  const [data, dispatch] = useReducer(reduceData, EMPTY_DATA);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    dataService
      .load(user)
      .then((loaded) => {
        if (!active) return;
        dispatch({ type: 'loaded', data: loaded });
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [user, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const clearMutationError = useCallback(() => setMutationError(null), []);

  const actions = useMemo<DataValue['actions']>(
    () => ({
      saveTask: async (task) => {
        setMutationError(null);
        try {
          const saved = await dataService.saveTask(task);
          dispatch({ type: 'task/save', task: saved });
          return saved;
        } catch {
          setMutationError('Não foi possível salvar a tarefa. Confira a conexão com a API e tente novamente.');
          throw new Error('TASK_SAVE_FAILED');
        }
      },
      toggleTask: async (id) => {
        setMutationError(null);
        try {
          const saved = await dataService.toggleTask(id);
          dispatch({ type: 'task/save', task: saved });
          return saved;
        } catch {
          setMutationError('Não foi possível atualizar a tarefa. Confira a conexão com a API e tente novamente.');
          throw new Error('TASK_UPDATE_FAILED');
        }
      },
      removeTask: async (id) => {
        setMutationError(null);
        try {
          await dataService.removeTask(id);
          dispatch({ type: 'task/remove', id });
        } catch {
          setMutationError('Não foi possível excluir a tarefa. Confira a conexão com a API e tente novamente.');
          throw new Error('TASK_DELETE_FAILED');
        }
      },
      enroll: async (id) => {
        setMutationError(null);
        try {
          const course = await dataService.enrollCourse(id);
          dispatch({ type: 'course/save', course });
          return course;
        } catch {
          setMutationError('Não foi possível se inscrever no curso. Confira a conexão com a API e tente novamente.');
          throw new Error('COURSE_ENROLL_FAILED');
        }
      },
      toggleLesson: async (courseId, lessonId) => {
        setMutationError(null);
        try {
          const course = await dataService.toggleLesson(courseId, lessonId);
          dispatch({ type: 'course/save', course });
          return course;
        } catch {
          setMutationError('Não foi possível atualizar o progresso da aula. Confira a conexão com a API.');
          throw new Error('LESSON_PROGRESS_FAILED');
        }
      },
      saveCourse: async (course) => {
        setMutationError(null);
        try {
          const saved = await dataService.saveCourse(course);
          dispatch({ type: 'course/save', course: saved });
          return saved;
        } catch {
          setMutationError('Não foi possível salvar o curso. Confira a conexão com a API e tente novamente.');
          throw new Error('COURSE_SAVE_FAILED');
        }
      },
      addDiscussion: async (discussion) => {
        const saved = await dataService.addDiscussion(discussion);
        dispatch({ type: 'discussion/add', discussion: saved });
      },
      removeDiscussion: async (id) => {
        await dataService.removeDiscussion(id);
        dispatch({ type: 'discussion/remove', id });
      },
      addReply: async (discussionId, reply) => {
        const saved = await dataService.addReply(discussionId, reply.body);
        dispatch({ type: 'discussion/save', discussion: saved });
      },
    }),
    [],
  );

  const value = useMemo(
    () => ({ status, mutationError, data, reload, clearMutationError, actions }),
    [status, mutationError, data, reload, clearMutationError, actions],
  );
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData deve ser usado dentro de <DataProvider>.');
  return ctx;
}
