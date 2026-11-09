import { buildSeed } from '../data/seed';
import type { AppData, User } from '../types';

// Serviço de dados SIMULADO: devolve os dados de demonstração depois de uma
// pequena espera, para que os estados de carregamento e de erro das telas
// possam ser vistos. Quando existir uma API, troque o corpo de `load` por uma
// chamada real e apague `SIMULATE_BACKEND`; as telas não precisam mudar.
const SIMULATE_BACKEND = true;

// Mude para true para ver a tela de erro com o botão "Tentar novamente".
export const FORCE_LOAD_ERROR = false;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const dataService = {
  async load(user: User): Promise<AppData> {
    if (!SIMULATE_BACKEND) throw new Error('DATA_NOT_CONFIGURED');
    await wait(700);
    if (FORCE_LOAD_ERROR) throw new Error('LOAD_FAILED');
    return buildSeed(user);
  },
};
