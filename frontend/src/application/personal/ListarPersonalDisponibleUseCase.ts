import { PersonalRepository } from "../../domain/repositories/PersonalRepository";
import { Personal } from "../../domain/entities/Personal";

export class ListarPersonalDisponibleUseCase {
  constructor(private readonly personalRepository: PersonalRepository) {}

  execute(fechaInicio: string, fechaFin: string): Promise<Personal[]> {
    return this.personalRepository.listarDisponibles(fechaInicio, fechaFin);
  }
}
