import { Usuario } from "../entities/Usuario";

export interface UsuarioRepository {
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  /** Para la cascada: al desactivar un Cliente, encontrar su Usuario (si tiene) y desactivarlo también. */
  findByClienteId(clienteId: string): Promise<Usuario | null>;
  /** Ídem, para Personal (Coordinador/Productor). */
  findByPersonalId(personalId: string): Promise<Usuario | null>;
  findAll(): Promise<Usuario[]>;
  save(usuario: Usuario): Promise<void>;
  actualizarPassword(usuarioId: string, nuevoPasswordHash: string): Promise<void>;
  actualizarEstadoActivo(usuarioId: string, activo: boolean): Promise<void>;
}
