import { PersonalRepository, PersonalInput } from "../../domain/repositories/PersonalRepository";
import { Personal } from "../../domain/entities/Personal";

export class CrearPersonalUseCase {
  constructor(private readonly personalRepository: PersonalRepository) {}

  execute(data: PersonalInput): Promise<Personal> {
    return this.personalRepository.crear(data);
  }
}
