import { Sede } from "../entities/Sede";

export interface SedeRepository {
  /** SOLO COORDINADOR */
  crear(eventoId: string, data: Omit<Sede, 'id' | 'eventoId' | 'createdAt'>): Promise<Sede>;
  listarPorEvento(eventoId: string): Promise<Sede[]>;
}
