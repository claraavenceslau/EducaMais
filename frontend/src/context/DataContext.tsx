import {
  createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState,
} from 'react';
import { dataService } from '../services/dataService';
import { EMPTY_DATA } from '../types';
import { useAuth } from './AuthContext';
import type {
  Appointment, AppData, Course, Demand, DemandEvent, Discussion, Profile, Reply, Review, Task, User,
} from '../types';
import type { DeepPartialPrefs } from './dataReducer';
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
    saveReview: (review: Review) => void;
    removeReview: (id: string) => void;
    addDemand: (demand: Demand) => void;
    addDemandEvent: (id: string, event: DemandEvent) => void;
    readNotice: (id: string) => void;
    readAllNotices: () => void;
    saveAppointment: (appointment: Appointment) => void;
    cancelAppointment: (id: string) => void;
    setPreferences: (patch: DeepPartialPrefs) => void;
    saveProfile: (profile: Profile) => void;
    /** Apaga os dados salvos deste aparelho e volta aos dados de demonstração. */
    resetData: () => Promise<void>;
  };
};

const DataContext = createContext<DataValue | undefined>(undefined);

export function DataProvider({ user, children }: { user: User; children: ReactNode }) {
  const [data, dispatch] = useReducer(reduceData, EMPTY_DATA);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  const { updateUser } = useAuth();

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
  }, [user.id, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  // Salva no aparelho (depois de uma pausa) a cada alteração, só com os dados já carregados.
  useEffect(() => {
    if (status !== 'ready') return;
    const timer = setTimeout(() => {
      dataService.save(user, data);
    }, 400);
    return () => clearTimeout(timer);
  }, [data, status, user]);

  // Se o nome foi editado em outra sessão, aplica ao usuário logado.
  useEffect(() => {
    if (status === 'ready' && data.profile.name && data.profile.name !== user.name) {
      updateUser({ name: data.profile.name });
    }
  }, [status, data.profile.name, user.name, updateUser]);

  const userRef = useRef(user);
  userRef.current = user;

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
      saveReview: (review) => dispatch({ type: 'review/save', review }),
      removeReview: (id) => dispatch({ type: 'review/remove', id }),
      addDemand: (demand) => dispatch({ type: 'demand/add', demand }),
      addDemandEvent: (id, event) => dispatch({ type: 'demand/event', id, event }),
      readNotice: (id) => dispatch({ type: 'notice/read', id }),
      readAllNotices: () => dispatch({ type: 'notice/readAll' }),
      saveAppointment: (appointment) => dispatch({ type: 'appointment/save', appointment }),
      cancelAppointment: (id) => dispatch({ type: 'appointment/cancel', id }),
      setPreferences: (patch) => dispatch({ type: 'prefs/set', patch }),
      saveProfile: (profile) => dispatch({ type: 'profile/save', profile }),
      resetData: async () => {
        await dataService.clear(userRef.current);
        setAttempt((n) => n + 1);
      },
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
