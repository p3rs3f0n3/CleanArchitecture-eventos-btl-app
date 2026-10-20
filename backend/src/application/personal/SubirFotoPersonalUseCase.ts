import { Personal } from "../../domain/entities/Personal";
import { PersonalRepository } from "../../domain/repositories/PersonalRepository";
import { NotFoundError } from "../../domain/exceptions/DomainError";

/** ADMIN/COORDINADOR — asocia la URL de una foto ya subida (ver uploadMiddleware) a un Personal. */
export class SubirFotoPersonalUseCase {
  constructor(private readonly personalRepository: PersonalRepository) {}

  async execute(personalId: string, fotoUrl: string): Promise<Personal> {
    const personal = await this.personalRepository.findById(personalId);
    if (!personal) {
      throw new NotFoundError(`No existe personal con id "${personalId}".`);
    }
    personal.actualizarFoto(fotoUrl);
    await this.personalRepository.actualizar(personal);
    return personal;
  }
}
