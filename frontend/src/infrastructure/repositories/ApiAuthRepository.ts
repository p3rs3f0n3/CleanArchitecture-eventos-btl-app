import { ApiClient } from "../http/ApiClient";
import { AuthRepository, LoginResult, RegisterData } from "../../domain/repositories/AuthRepository";
import { Usuario } from "../../domain/entities/Usuario";

export class ApiAuthRepository implements AuthRepository {
  login(email: string, password: string): Promise<LoginResult> {
    return ApiClient.post<LoginResult>('/auth/login', { email, password });
  }

  register(data: RegisterData): Promise<Usuario> {
    return ApiClient.post<Usuario>('/auth/register', data);
  }

  async cambiarPassword(passwordActual: string, passwordNueva: string): Promise<void> {
    await ApiClient.patch('/auth/password', { passwordActual, passwordNueva });
  }
}
