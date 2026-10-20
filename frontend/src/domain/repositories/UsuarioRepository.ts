import { UsuarioCuenta } from "../entities/Usuario";

/** Todo este contrato es SOLO ADMIN (panel de Administración). */
export interface UsuarioRepository {
  listar(): Promise<UsuarioCuenta[]>;
  cambiarEstadoActivo(usuarioId: string, activo: boolean): Promise<void>;
  resetearPassword(usuarioId: string, passwordNueva: string): Promise<void>;
}
