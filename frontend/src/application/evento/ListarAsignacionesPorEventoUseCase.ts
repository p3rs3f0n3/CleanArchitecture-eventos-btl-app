import { PersonalRepository } from "../../domain/repositories/PersonalRepository";
import { AsignacionEvento } from "../../domain/entities/AsignacionEvento";

export class ListarAsignacionesPorEventoUseCase {
  constructor(private readonly personalRepository: PersonalRepository) {}

  execute(eventoId: string): Promise<AsignacionEvento[]> {
    return this.personalRepository.listarAsignacionesPorEvento(eventoId);
  }
}
