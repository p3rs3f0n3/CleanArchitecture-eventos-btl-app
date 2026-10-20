import { CategoriaRepository } from "../../domain/repositories/CategoriaRepository";
import { Categoria } from "../../domain/entities/Categoria";

export class ListarCategoriasUseCase {
  constructor(private readonly categoriaRepository: CategoriaRepository) {}

  execute(): Promise<Categoria[]> {
    return this.categoriaRepository.listar();
  }
}
