import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { Evento, EstadoEvento } from "../../domain/entities/Evento";

export class CambiarEstadoEventoUseCase {
  constructor(private readonly eventoRepository: EventoRepository) {}

  execute(eventoId: string, nuevoEstado: EstadoEvento, evidencia: { fotoUrl?: string; observacion?: string }): Promise<Evento> {
    return this.eventoRepository.cambiarEstado(eventoId, nuevoEstado, evidencia);
  }
}
