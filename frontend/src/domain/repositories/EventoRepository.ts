import { Evento, EstadoEvento } from "../entities/Evento";

export interface CrearEventoData {
  nombre: string;
  descripcion: string;
  imagenUrl?: string;
  fechaInicio: string;
  fechaFin: string;
  clienteId: string;
}

export interface EventoRepository {
  listarPorCliente(clienteId: string): Promise<Evento[]>;
  /** "Mis eventos" del PRODUCTOR — sus eventos asignados, de cualquier cliente. */
  listarAsignados(): Promise<Evento[]>;
  crear(data: CrearEventoData): Promise<Evento>;
  cambiarEstado(eventoId: string, nuevoEstado: EstadoEvento, evidencia: { fotoUrl?: string; observacion?: string }): Promise<Evento>;
  /** SOLO COORDINADOR */
  subirImagen(eventoId: string, archivo: File): Promise<Evento>;
}
