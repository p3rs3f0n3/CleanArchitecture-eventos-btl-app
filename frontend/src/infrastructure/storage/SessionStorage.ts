import { Usuario } from "../../domain/entities/Usuario";

const SESSION_KEY = 'eventos_btl_session';

export interface StoredSession {
  token: string;
  usuario: Usuario;
}

/** Guarda la sesión completa (no solo el token) en localStorage, así al
 *  recargar la página se puede restaurar quién estaba logueado sin pegarle
 *  a un endpoint "/me" que el backend no tiene en este MVP. */
export const SessionStorage = {
  get(): StoredSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      return null;
    }
  },
  set(session: StoredSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  clear(): void {
    localStorage.removeItem(SESSION_KEY);
  },
  getToken(): string | null {
    return SessionStorage.get()?.token ?? null;
  },
};
