import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { PasswordHasher } from "../../domain/services/PasswordHasher";
import { NotFoundError, InvalidPropValueError } from "../../domain/exceptions/DomainError";

/**
 * SOLO ADMIN — resetea la contraseña de CUALQUIER usuario SIN pedir la
 * anterior (a diferencia de CambiarPasswordUseCase, que es self-service).
 * Es el "ayudar a desbloquear" que describiste: un Coordinador se olvidó su
 * contraseña, el Admin le asigna una temporal nueva.
 */
export class ResetearPasswordUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(usuarioId: string, passwordNueva: string): Promise<void> {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new NotFoundError(`No existe un usuario con id "${usuarioId}".`);
    }
    if (passwordNueva.length < 8) {
      throw new InvalidPropValueError("La nueva contraseña debe tener al menos 8 caracteres.");
    }
    const nuevoHash = await this.passwordHasher.hash(passwordNueva);
    await this.usuarioRepository.actualizarPassword(usuario.id, nuevoHash);
  }
}
