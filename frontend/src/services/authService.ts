import type { User } from '../types';

export type AccountRole = 'aluno' | 'professor';

export type Credentials = { email: string; password: string };

export type SignUpData = {
  role: AccountRole;
  name: string;
  email: string;
  password: string;
};

export class InvalidCredentialsError extends Error {}

export interface AuthService {
  signIn(credentials: Credentials): Promise<User>;
  signUp(data: SignUpData): Promise<User>;
  requestPasswordReset(email: string): Promise<void>;
}

// Enquanto não existe back-end, cadastro, recuperação de senha e o modo de
// demonstração são SIMULADOS. Quando a API existir, implemente as chamadas
// reais e mude para false (o modo de demonstração some da tela de login).
const SIMULATE_BACKEND = true;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const DEMO_USERS: Record<AccountRole, User> = {
  aluno: { id: 'demo-aluno', name: 'Allan Aluno', email: 'aluno@demo.educa', role: 'aluno' },
  professor: { id: 'demo-professor', name: 'Allan Professor', email: 'professor@demo.educa', role: 'professor' },
};

export const authService: AuthService & {
  /** true enquanto o app usa dados e sessão de demonstração. */
  readonly demoEnabled: boolean;
  signInDemo(role: AccountRole): Promise<User>;
} = {
  demoEnabled: SIMULATE_BACKEND,

  // O login com e-mail e senha nunca simula sucesso: sem serviço real, ele falha.
  // Para explorar o app sem servidor, use o modo de demonstração (signInDemo).
  async signIn() {
    throw new Error('AUTH_NOT_CONFIGURED');
  },

  async signUp(data) {
    if (SIMULATE_BACKEND) {
      await wait(1200);
      // Nada é guardado nem enviado: a senha não sai desta função.
      return {
        id: `sim-${Date.now().toString(36)}`,
        name: data.name,
        email: data.email,
        role: data.role,
      };
    }
    // TODO: chamada real de cadastro
    throw new Error('AUTH_NOT_CONFIGURED');
  },

  async requestPasswordReset() {
    if (SIMULATE_BACKEND) {
      await wait(1200);
      return;
    }
    // TODO: chamada real de recuperação de senha
    throw new Error('AUTH_NOT_CONFIGURED');
  },

  async signInDemo(role) {
    if (!SIMULATE_BACKEND) throw new Error('AUTH_NOT_CONFIGURED');
    await wait(400);
    return DEMO_USERS[role];
  },
};
