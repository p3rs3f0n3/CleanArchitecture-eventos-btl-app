import { PersonalRepository } from "../../domain/repositories/PersonalRepository";
import { Personal } from "../../domain/entities/Personal";

export class CambiarEstadoActivoPersonalUseCase {
  constructor(private readonly personalRepository: PersonalRepository) {}

  execute(personalId: string, activo: boolean): Promise<Personal> {
    return this.personalRepository.cambiarEstadoActivo(personalId, activo);
  }
}
