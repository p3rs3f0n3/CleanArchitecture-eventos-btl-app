import { Sede } from "../entities/Sede";

export interface SedeRepository {
  crear(sede: Sede): Promise<void>;
  findByEventoId(eventoId: string): Promise<Sede[]>;
  /** Para saber si una Ciudad está en uso antes de dejar borrarla. */
  findByCiudadId(ciudadId: string): Promise<Sede[]>;
}
