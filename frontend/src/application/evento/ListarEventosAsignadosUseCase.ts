import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { Evento } from "../../domain/entities/Evento";

export class ListarEventosAsignadosUseCase {
  constructor(private readonly eventoRepository: EventoRepository) {}

  execute(): Promise<Evento[]> {
    return this.eventoRepository.listarAsignados();
  }
}
