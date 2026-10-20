import { Categoria } from "../entities/Categoria";

export interface CategoriaRepository {
  findById(id: string): Promise<Categoria | null>;
  findByNombre(nombre: string): Promise<Categoria | null>;
  findAll(): Promise<Categoria[]>;
  save(categoria: Categoria): Promise<void>;
}
