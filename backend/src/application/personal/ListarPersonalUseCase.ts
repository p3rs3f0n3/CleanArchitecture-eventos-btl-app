import { Personal } from "../../domain/entities/Personal";
import { PersonalRepository } from "../../domain/repositories/PersonalRepository";

export class ListarPersonalUseCase {
  constructor(private readonly personalRepository: PersonalRepository) {}

  execute(): Promise<Personal[]> {
    return this.personalRepository.findAll();
  }
}
