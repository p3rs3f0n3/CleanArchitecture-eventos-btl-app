import { Usuario } from "../../domain/entities/Usuario";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";

/** SOLO ADMIN — ver todas las cuentas del sistema (para poder bloquearlas/resetear su contraseña). */
export class ListarUsuariosUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  execute(): Promise<Usuario[]> {
    return this.usuarioRepository.findAll();
  }
}
