import { EntradaInforme } from "../entities/EntradaInforme";

export interface EntradaInformeRepository {
  /** Orden cronológico (la más vieja primero): así se lee el informe de arriba para abajo. */
  findByInformeId(informeId: string): Promise<EntradaInforme[]>;
  save(entrada: EntradaInforme): Promise<void>;
}
