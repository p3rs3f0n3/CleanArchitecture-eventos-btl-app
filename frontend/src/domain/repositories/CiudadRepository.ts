import { Ciudad } from "../entities/Ciudad";

export interface CiudadRepository {
  listar(): Promise<Ciudad[]>;
  /** SOLO ADMIN */
  crear(data: Omit<Ciudad, 'id' | 'createdAt'>): Promise<Ciudad>;
  /** SOLO ADMIN */
  eliminar(id: string): Promise<void>;
}
