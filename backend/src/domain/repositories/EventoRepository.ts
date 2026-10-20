import { Evento } from "../entities/Evento";

export interface EventoRepository {
  findById(id: string): Promise<Evento | null>;
  findByClienteId(clienteId: string): Promise<Evento[]>;
  /** Para "Mis eventos" del Productor — sus eventos asignados pueden ser de cualquier cliente. */
  findByIds(ids: string[]): Promise<Evento[]>;
  save(evento: Evento): Promise<void>;
  update(evento: Evento): Promise<void>;
  actualizarImagen(eventoId: string, imagenUrl: string): Promise<void>;
}
