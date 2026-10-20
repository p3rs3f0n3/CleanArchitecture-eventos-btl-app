import { ApiClient } from "../http/ApiClient";
import { CategoriaRepository } from "../../domain/repositories/CategoriaRepository";
import { Categoria } from "../../domain/entities/Categoria";

export class ApiCategoriaRepository implements CategoriaRepository {
  listar(): Promise<Categoria[]> {
    return ApiClient.get<Categoria[]>('/categorias');
  }

  crear(data: Omit<Categoria, 'id' | 'createdAt'>): Promise<Categoria> {
    return ApiClient.post<Categoria>('/categorias', data);
  }
}
