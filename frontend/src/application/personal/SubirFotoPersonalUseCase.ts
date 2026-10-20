import { PersonalRepository } from "../../domain/repositories/PersonalRepository";
import { Personal } from "../../domain/entities/Personal";

export class SubirFotoPersonalUseCase {
  constructor(private readonly personalRepository: PersonalRepository) {}

  execute(personalId: string, archivo: File): Promise<Personal> {
    return this.personalRepository.subirFoto(personalId, archivo);
  }
}
