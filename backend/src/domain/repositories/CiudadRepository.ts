import { Ciudad } from "../entities/Ciudad";

export interface CiudadRepository {
  findById(id: string): Promise<Ciudad | null>;
  findByNombre(nombre: string): Promise<Ciudad | null>;
  findAll(): Promise<Ciudad[]>;
  save(ciudad: Ciudad): Promise<void>;
  delete(id: string): Promise<void>;
}
