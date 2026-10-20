import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Usuario } from '../../domain/entities/Usuario';
import { SessionStorage } from '../../infrastructure/storage/SessionStorage';
import { useCases } from '../../infrastructure/di';

interface AuthContextValue {
  usuario: Usuario | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  cargando: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Se restaura desde localStorage al montar, así un F5 no te saca de sesión.
  const [usuario, setUsuario] = useState<Usuario | null>(() => SessionStorage.get()?.usuario ?? null);
  const [cargando, setCargando] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setCargando(true);
    try {
      const { token, usuario } = await useCases.login.execute(email, password);
      SessionStorage.set({ token, usuario });
      setUsuario(usuario);
    } finally {
      setCargando(false);
    }
  }, []);

  const logout = useCallback(() => {
    SessionStorage.clear();
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
