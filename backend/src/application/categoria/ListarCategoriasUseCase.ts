import { Categoria } from "../../domain/entities/Categoria";
import { CategoriaRepository } from "../../domain/repositories/CategoriaRepository";

export class ListarCategoriasUseCase {
  constructor(private readonly categoriaRepository: CategoriaRepository) {}

  public execute(): Promise<Categoria[]> {
    return this.categoriaRepository.findAll();
  }
}
