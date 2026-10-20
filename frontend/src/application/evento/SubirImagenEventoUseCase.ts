import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { Evento } from "../../domain/entities/Evento";

export class SubirImagenEventoUseCase {
  constructor(private readonly eventoRepository: EventoRepository) {}

  execute(eventoId: string, archivo: File): Promise<Evento> {
    return this.eventoRepository.subirImagen(eventoId, archivo);
  }
}
