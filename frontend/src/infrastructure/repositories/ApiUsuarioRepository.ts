import { ApiClient } from "../http/ApiClient";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { UsuarioCuenta } from "../../domain/entities/Usuario";

export class ApiUsuarioRepository implements UsuarioRepository {
  listar(): Promise<UsuarioCuenta[]> {
    return ApiClient.get<UsuarioCuenta[]>('/usuarios');
  }

  async cambiarEstadoActivo(usuarioId: string, activo: boolean): Promise<void> {
    await ApiClient.patch(`/usuarios/${usuarioId}/estado`, { activo });
  }

  async resetearPassword(usuarioId: string, passwordNueva: string): Promise<void> {
    await ApiClient.patch(`/usuarios/${usuarioId}/password`, { passwordNueva });
  }
}
