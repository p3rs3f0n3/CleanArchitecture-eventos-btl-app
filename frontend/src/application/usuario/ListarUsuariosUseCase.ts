import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { UsuarioCuenta } from "../../domain/entities/Usuario";

export class ListarUsuariosUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  execute(): Promise<UsuarioCuenta[]> {
    return this.usuarioRepository.listar();
  }
}
