import AsyncStorage from '@react-native-async-storage/async-storage';

// Armazenamento local do aparelho. Toda leitura e escrita é protegida: se o sistema
// recusar (disco cheio, modo privado na web), o app segue funcionando sem salvar.
const PREFIX = 'educa:v1:';

export const storage = {
  async get(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(PREFIX + key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(PREFIX + key, value);
      return true;
    } catch {
      return false;
    }
  },
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREFIX + key);
    } catch {
      // nada a fazer
    }
  },
};

export const dataKey = (userId: string) => `data:${userId}`;
export const draftKey = (userId: string, name: string) => `draft:${userId}:${name}`;

/** Formulários que guardam rascunho (ver hooks/useFormDraft). */
export const DRAFT_NAMES = ['demand', 'discussion'] as const;

export async function clearDrafts(userId: string): Promise<void> {
  await Promise.all(DRAFT_NAMES.map((n) => storage.remove(draftKey(userId, n))));
}
