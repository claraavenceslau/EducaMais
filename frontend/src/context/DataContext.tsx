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
  data: AppData;
  reload: () => void;
  actions: {
    saveTask: (task: Task) => void;
    toggleTask: (id: string) => void;
    removeTask: (id: string) => void;
    enroll: (courseId: string) => void;
    toggleLesson: (courseId: string, lessonId: string) => void;
    saveCourse: (course: Course) => void;
    addDiscussion: (discussion: Discussion) => void;
    removeDiscussion: (id: string) => void;
    addReply: (discussionId: string, reply: Reply) => void;
  };
};

const DataContext = createContext<DataValue | undefined>(undefined);

export function DataProvider({ user, children }: { user: User; children: ReactNode }) {
  const [data, dispatch] = useReducer(reduceData, EMPTY_DATA);
  const [status, setStatus] = useState<LoadStatus>('loading');
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

  const actions = useMemo<DataValue['actions']>(
    () => ({
      saveTask: (task) => dispatch({ type: 'task/save', task }),
      toggleTask: (id) => dispatch({ type: 'task/toggle', id }),
      removeTask: (id) => dispatch({ type: 'task/remove', id }),
      enroll: (id) => dispatch({ type: 'course/enroll', id }),
      toggleLesson: (courseId, lessonId) => dispatch({ type: 'course/toggleLesson', courseId, lessonId }),
      saveCourse: (course) => dispatch({ type: 'course/save', course }),
      addDiscussion: (discussion) => dispatch({ type: 'discussion/add', discussion }),
      removeDiscussion: (id) => dispatch({ type: 'discussion/remove', id }),
      addReply: (discussionId, reply) => dispatch({ type: 'reply/add', discussionId, reply }),
    }),
    [],
  );

  const value = useMemo(() => ({ status, data, reload, actions }), [status, data, reload, actions]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData deve ser usado dentro de <DataProvider>.');
  return ctx;
}
