import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { User } from '../types';

export type AccountRole = 'aluno' | 'professor';
export type Credentials = { email: string; password: string };
export type SignUpData = { role: AccountRole; name: string; email: string; password: string };

export class AuthApiError extends Error {
  constructor(public readonly code: string, public readonly status: number, message: string) {
    super(message);
    this.name = 'AuthApiError';
  }
}

export class InvalidCredentialsError extends Error {}
export class EmailAlreadyRegisteredError extends Error {}
export class PasswordResetUnavailableError extends Error {}
export class AccountNotFoundError extends Error {}

export interface AuthService {
  signIn(credentials: Credentials): Promise<User>;
  signUp(data: SignUpData): Promise<User>;
  requestPasswordReset(email: string): Promise<{ resetToken: string }>;
  resetPassword(token: string, password: string): Promise<void>;
  restoreSession(): Promise<User | null>;
  clearSession(): Promise<void>;
}

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
const TOKEN_KEY = 'educamais.access-token';
let webToken: string | null = null;

type AuthResponse = { user: User; token: string };
type PasswordResetResponse = { resetToken: string };
type ErrorResponse = { error?: { code?: string; message?: string } };

async function readToken(): Promise<string | null> {
  return Platform.OS === 'web' ? webToken : SecureStore.getItemAsync(TOKEN_KEY);
}

async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    webToken = token;
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function removeToken(): Promise<void> {
  if (Platform.OS === 'web') {
    webToken = null;
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new AuthApiError('API_UNAVAILABLE', 0, 'Não foi possível conectar à API.');
  }

  const body = await response.json().catch(() => ({})) as ErrorResponse & T;
  if (!response.ok) {
    throw new AuthApiError(
      body.error?.code ?? 'REQUEST_FAILED',
      response.status,
      body.error?.message ?? 'A solicitação não foi concluída.',
    );
  }
  return body;
}

export async function authenticatedRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  return request<T>(path, init, (await readToken()) ?? undefined);
}

async function authenticate(path: '/auth/login' | '/auth/register', data: Credentials | SignUpData): Promise<User> {
  const result = await request<AuthResponse>(path, { method: 'POST', body: JSON.stringify(data) });
  await saveToken(result.token);
  return result.user;
}

export const authService: AuthService & {
  readonly demoEnabled: boolean;
  signInDemo(role: AccountRole): Promise<User>;
} = {
  demoEnabled: false,

  async signIn(credentials) {
    try {
      return await authenticate('/auth/login', { ...credentials, email: credentials.email.trim().toLowerCase() });
    } catch (error) {
      if (error instanceof AuthApiError && error.code === 'INVALID_CREDENTIALS') {
        throw new InvalidCredentialsError();
      }
      throw error;
    }
  },

  async signUp(data) {
    try {
      return await authenticate('/auth/register', { ...data, email: data.email.trim().toLowerCase() });
    } catch (error) {
      if (error instanceof AuthApiError && error.code === 'EMAIL_ALREADY_REGISTERED') {
        throw new EmailAlreadyRegisteredError();
      }
      throw error;
    }
  },

  async requestPasswordReset(email) {
    try {
      const result = await request<PasswordResetResponse>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      return { resetToken: result.resetToken };
    } catch (error) {
      if (error instanceof AuthApiError && error.code === 'PASSWORD_RESET_EMAIL_NOT_CONFIGURED') {
        throw new PasswordResetUnavailableError();
      }
      if (error instanceof AuthApiError && error.code === 'ACCOUNT_NOT_FOUND') {
        throw new AccountNotFoundError();
      }
      throw error;
    }
  },

  async resetPassword(token, password) {
    await request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  async restoreSession() {
    const token = await readToken();
    if (!token) return null;
    try {
      const result = await request<{ user: User }>('/auth/me', {}, token);
      return result.user;
    } catch {
      await removeToken();
      return null;
    }
  },

  clearSession: removeToken,

  async signInDemo() {
    throw new AuthApiError('DEMO_DISABLED', 0, 'O modo de demonstração foi desativado.');
  },
};
