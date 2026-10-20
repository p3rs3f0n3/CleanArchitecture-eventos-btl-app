import { PersonalRepository, PersonalInput } from "../../domain/repositories/PersonalRepository";
import { Personal } from "../../domain/entities/Personal";

export class ActualizarPersonalUseCase {
  constructor(private readonly personalRepository: PersonalRepository) {}

  execute(personalId: string, data: PersonalInput): Promise<Personal> {
    return this.personalRepository.actualizar(personalId, data);
  }
}
