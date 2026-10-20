import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { PasswordHasher } from "../../domain/services/PasswordHasher";
import { NotFoundError, UnauthorizedError, InvalidPropValueError } from "../../domain/exceptions/DomainError";

export interface CambiarPasswordInput {
  usuarioId: string;
  passwordActual: string;
  passwordNueva: string;
}

/** Self-service: el propio usuario logueado cambia su contraseña (necesita la actual para confirmar identidad). */
export class CambiarPasswordUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: CambiarPasswordInput): Promise<void> {
    const usuario = await this.usuarioRepository.findById(input.usuarioId);
    if (!usuario) {
      throw new NotFoundError("Usuario no encontrado.");
    }

    const passwordValida = await this.passwordHasher.compare(input.passwordActual, usuario.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedError("La contraseña actual no es correcta.");
    }

    if (input.passwordNueva.length < 8) {
      throw new InvalidPropValueError("La nueva contraseña debe tener al menos 8 caracteres.");
    }

    const nuevoHash = await this.passwordHasher.hash(input.passwordNueva);
    await this.usuarioRepository.actualizarPassword(usuario.id, nuevoHash);
  }
}
