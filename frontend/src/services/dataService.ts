import { buildSeed } from '../data/seed';
import type { AppData, User } from '../types';
import { restore, serialize } from '../utils/persist';
import { dataKey, storage } from './storage';

// Serviço de dados SEM servidor: os dados iniciais vêm de `buildSeed` e o que o usuário
// altera é salvo no próprio aparelho (AsyncStorage), separado por usuário.
// Quando existir uma API, troque o corpo de `load` e `save` por chamadas reais;
// as telas não precisam mudar.
const SIMULATE_BACKEND = true;

// Mude para true para ver a tela de erro com o botão "Tentar novamente".
export const FORCE_LOAD_ERROR = false;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const dataService = {
  async load(user: User): Promise<AppData> {
    if (!SIMULATE_BACKEND) throw new Error('DATA_NOT_CONFIGURED');
    await wait(500);
    if (FORCE_LOAD_ERROR) throw new Error('LOAD_FAILED');
    const saved = await storage.get(dataKey(user.id));
    return restore(saved, buildSeed(user));
  },

  async save(user: User, data: AppData): Promise<void> {
    await storage.set(dataKey(user.id), serialize(data));
  },

  /** Apaga o que foi salvo; o próximo `load` volta aos dados de demonstração. */
  async clear(user: User): Promise<void> {
    await storage.remove(dataKey(user.id));
  },
};
