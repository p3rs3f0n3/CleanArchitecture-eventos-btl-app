import { AsignacionEvento } from "../../domain/entities/AsignacionEvento";
import { AsignacionEventoRepository } from "../../domain/repositories/AsignacionEventoRepository";

export class ListarAsignacionesPorEventoUseCase {
  constructor(private readonly asignacionEventoRepository: AsignacionEventoRepository) {}

  execute(eventoId: string): Promise<AsignacionEvento[]> {
    return this.asignacionEventoRepository.findByEventoId(eventoId);
  }
}
