import { Informe } from "../entities/Informe";

export interface InformeRepository {
  findByEventoId(eventoId: string): Promise<Informe | null>;
  findById(id: string): Promise<Informe | null>;
  save(informe: Informe): Promise<void>;
  update(informe: Informe): Promise<void>;
}
