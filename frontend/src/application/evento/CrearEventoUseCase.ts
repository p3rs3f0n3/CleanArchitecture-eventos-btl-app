import { EventoRepository, CrearEventoData } from "../../domain/repositories/EventoRepository";
import { Evento } from "../../domain/entities/Evento";

export class CrearEventoUseCase {
  constructor(private readonly eventoRepository: EventoRepository) {}

  execute(data: CrearEventoData): Promise<Evento> {
    return this.eventoRepository.crear(data);
  }
}
