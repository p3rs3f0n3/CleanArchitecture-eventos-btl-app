import { Personal } from "../../domain/entities/Personal";
import { PersonalRepository } from "../../domain/repositories/PersonalRepository";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { NotFoundError } from "../../domain/exceptions/DomainError";

/**
 * SOLO ADMIN — activar/desactivar un Personal. CASCADA: si es un
 * Coordinador/Productor con cuenta de acceso, esa cuenta se bloquea/desbloquea
 * junto con él (el staff de evento nunca tiene Usuario, así que ahí no hay nada que cascadear).
 */
export class CambiarEstadoActivoPersonalUseCase {
  constructor(
    private readonly personalRepository: PersonalRepository,
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async execute(personalId: string, activo: boolean): Promise<Personal> {
    const personal = await this.personalRepository.findById(personalId);
    if (!personal) {
      throw new NotFoundError(`No existe personal con id "${personalId}".`);
    }
    personal.cambiarEstadoActivo(activo);
    await this.personalRepository.actualizar(personal);

    const usuario = await this.usuarioRepository.findByPersonalId(personalId);
    if (usuario) {
      await this.usuarioRepository.actualizarEstadoActivo(usuario.id, activo);
    }

    return personal;
  }
}
