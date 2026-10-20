import { CategoriaRepository } from "../../domain/repositories/CategoriaRepository";
import { Categoria } from "../../domain/entities/Categoria";

export class CrearCategoriaUseCase {
  constructor(private readonly categoriaRepository: CategoriaRepository) {}

  execute(data: Omit<Categoria, 'id' | 'createdAt'>): Promise<Categoria> {
    return this.categoriaRepository.crear(data);
  }
}
