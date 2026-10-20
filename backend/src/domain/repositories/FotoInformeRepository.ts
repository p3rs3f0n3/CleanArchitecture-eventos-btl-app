import { FotoInforme } from "../entities/FotoInforme";

export interface FotoInformeRepository {
  findByInformeId(informeId: string): Promise<FotoInforme[]>;
  findById(id: string): Promise<FotoInforme | null>;
  save(foto: FotoInforme): Promise<void>;
  delete(id: string): Promise<void>;
}
