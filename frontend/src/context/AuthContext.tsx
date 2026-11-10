import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

type AuthValue = {
  user: User | null;
  isRestoring: boolean;
  /** Abre a sessão com o usuário informado (real, quando houver API, ou de demonstração). */
  startSession: (user: User) => void;
  endSession: () => void;
  /** Atualiza dados do usuário já logado (hoje, só o nome). */
  updateUser: (patch: Partial<Pick<User, 'name'>>) => void;
};

const AuthContext = createContext<AuthValue | undefined>(undefined);

// A sessão fica só na memória do aplicativo: ao fechá-lo, o usuário precisa entrar de novo.
// Com API real, guarde o token em armazenamento seguro (expo-secure-store), nunca a senha.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let active = true;
    authService.restoreSession()
      .then((restoredUser) => { if (active) setUser(restoredUser); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setIsRestoring(false); });
    return () => { active = false; };
  }, []);

  const endSession = useCallback(() => {
    setUser(null);
    void authService.clearSession();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, isRestoring, startSession: setUser, endSession }),
    [user, isRestoring, endSession],
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
