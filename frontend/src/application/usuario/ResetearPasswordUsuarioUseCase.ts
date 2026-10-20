import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";

export class ResetearPasswordUsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  execute(usuarioId: string, passwordNueva: string): Promise<void> {
    return this.usuarioRepository.resetearPassword(usuarioId, passwordNueva);
  }
}
