import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import type { User } from '../types';

type AuthValue = {
  user: User | null;
  /** Abre a sessão com o usuário informado (real, quando houver API, ou de demonstração). */
  startSession: (user: User) => void;
  endSession: () => void;
};

const AuthContext = createContext<AuthValue | undefined>(undefined);

// A sessão fica só na memória do aplicativo: ao fechá-lo, o usuário precisa entrar de novo.
// Com API real, guarde o token em armazenamento seguro (expo-secure-store), nunca a senha.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const value = useMemo<AuthValue>(
    () => ({ user, startSession: setUser, endSession: () => setUser(null) }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return ctx;
}

/** Usuário logado; só use em telas que existem depois do login. */
export function useUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error('useUser foi chamado sem sessão aberta.');
  return user;
}
