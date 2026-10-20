import { Evento } from "../../domain/entities/Evento";
import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { ClienteRepository } from "../../domain/repositories/ClienteRepository";
import { NotFoundError, ConflictError } from "../../domain/exceptions/DomainError";

/** COORDINADOR (ver eventoRoutes.ts) — asocia la URL de una foto ya subida (ver uploadMiddleware) a un Evento. */
export class SubirImagenEventoUseCase {
  constructor(
    private readonly eventoRepository: EventoRepository,
    private readonly clienteRepository: ClienteRepository,
  ) {}

  async execute(eventoId: string, imagenUrl: string): Promise<Evento> {
    const evento = await this.eventoRepository.findById(eventoId);
    if (!evento) {
      throw new NotFoundError(`No existe un evento con id "${eventoId}".`);
    }
    const cliente = await this.clienteRepository.findById(evento.clienteId);
    if (!cliente?.activo) {
      throw new ConflictError(`El cliente dueño de este evento está inactivo. No se pueden hacer cambios en sus eventos.`);
    }
    evento.actualizarImagen(imagenUrl);
    await this.eventoRepository.actualizarImagen(eventoId, imagenUrl);
    return evento;
  }
}
