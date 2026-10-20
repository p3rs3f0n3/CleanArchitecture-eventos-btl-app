import { Usuario, RolSistema } from "../entities/Usuario";

export interface LoginResult {
  token: string;
  usuario: Usuario;
}

export interface RegisterData {
  email: string;
  password: string;
  rol: RolSistema;
  clienteId?: string;
  personalId?: string;
}

export interface AuthRepository {
  login(email: string, password: string): Promise<LoginResult>;
  register(data: RegisterData): Promise<Usuario>;
  cambiarPassword(passwordActual: string, passwordNueva: string): Promise<void>;
}
