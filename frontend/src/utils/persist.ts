import { DEFAULT_PREFERENCES } from '../types';
import type { AppData } from '../types';

/** Mude quando a forma dos dados salvos mudar de um jeito incompatível. */
export const DATA_VERSION = 1;

export type Snapshot = { version: number; savedAt: string; data: Partial<AppData> };

export const serialize = (data: AppData, now: Date = new Date()): string =>
  JSON.stringify({ version: DATA_VERSION, savedAt: now.toISOString(), data } satisfies Snapshot);

const LIST_KEYS = [
  'tasks', 'courses', 'discussions', 'achievements', 'ranking',
  'activity', 'reviews', 'demands', 'notices', 'appointments',
] as const;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Junta o que foi salvo com os dados iniciais. Qualquer coisa estranha (texto corrompido,
 * versão diferente, campo com tipo errado) é ignorada e o campo volta ao valor inicial.
 * Campos novos, que não existiam quando o app salvou, também ficam com o valor inicial.
 */
export function restore(raw: string | null | undefined, seed: AppData): AppData {
  if (!raw) return seed;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return seed;
  }
  if (!isObject(parsed) || parsed.version !== DATA_VERSION || !isObject(parsed.data)) return seed;
  const stored = parsed.data;
  const result: AppData = { ...seed };

  for (const key of LIST_KEYS) {
    const value = stored[key];
    if (Array.isArray(value)) (result as Record<string, unknown>)[key] = value;
  }
  if (isObject(stored.progress)) result.progress = { ...seed.progress, ...(stored.progress as object) };
  if (isObject(stored.profile)) result.profile = { ...(stored.profile as object) };
  if (isObject(stored.preferences)) {
    const p = stored.preferences as Partial<AppData['preferences']>;
    result.preferences = {
      notifications: { ...DEFAULT_PREFERENCES.notifications, ...(p.notifications ?? {}) },
      privacy: { ...DEFAULT_PREFERENCES.privacy, ...(p.privacy ?? {}) },
    };
  }
  return result;
}
