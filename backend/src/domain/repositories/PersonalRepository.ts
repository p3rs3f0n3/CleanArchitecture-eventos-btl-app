import { Personal } from "../entities/Personal";

export interface PersonalRepository {
  findById(id: string): Promise<Personal | null>;
  findAll(): Promise<Personal[]>;
  save(personal: Personal): Promise<void>;
  /** Persiste TODOS los campos editables (datos + activo) del personal ya modificado en memoria. */
  actualizar(personal: Personal): Promise<void>;
}
