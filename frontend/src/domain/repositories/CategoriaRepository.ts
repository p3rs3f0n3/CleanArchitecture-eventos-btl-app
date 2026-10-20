import { Categoria } from "../entities/Categoria";

export interface CategoriaRepository {
  listar(): Promise<Categoria[]>;
  crear(data: Omit<Categoria, 'id' | 'createdAt'>): Promise<Categoria>;
}
