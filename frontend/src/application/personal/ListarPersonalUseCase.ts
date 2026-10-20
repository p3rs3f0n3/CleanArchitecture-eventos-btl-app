import { PersonalRepository } from "../../domain/repositories/PersonalRepository";
import { Personal } from "../../domain/entities/Personal";

export class ListarPersonalUseCase {
  constructor(private readonly personalRepository: PersonalRepository) {}

  execute(): Promise<Personal[]> {
    return this.personalRepository.listarTodos();
  }
}
