import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";

export class CambiarEstadoActivoUsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  execute(usuarioId: string, activo: boolean): Promise<void> {
    return this.usuarioRepository.cambiarEstadoActivo(usuarioId, activo);
  }
}
