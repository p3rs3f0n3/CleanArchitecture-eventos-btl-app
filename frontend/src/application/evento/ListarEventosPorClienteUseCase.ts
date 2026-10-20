import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { Evento } from "../../domain/entities/Evento";

export class ListarEventosPorClienteUseCase {
  constructor(private readonly eventoRepository: EventoRepository) {}

  execute(clienteId: string): Promise<Evento[]> {
    return this.eventoRepository.listarPorCliente(clienteId);
  }
}
