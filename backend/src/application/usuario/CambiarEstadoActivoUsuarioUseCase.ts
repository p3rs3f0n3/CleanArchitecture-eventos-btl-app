import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { NotFoundError } from "../../domain/exceptions/DomainError";

/** SOLO ADMIN — bloquear/desbloquear la cuenta de un Cliente, Coordinador o Productor. */
export class CambiarEstadoActivoUsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async execute(usuarioId: string, activo: boolean): Promise<void> {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new NotFoundError(`No existe un usuario con id "${usuarioId}".`);
    }
    usuario.cambiarEstadoActivo(activo);
    await this.usuarioRepository.actualizarEstadoActivo(usuario.id, activo);
  }
}
