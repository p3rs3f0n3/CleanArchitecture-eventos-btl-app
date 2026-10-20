import { randomUUID } from "node:crypto";
import { Categoria } from "../../domain/entities/Categoria";
import { CategoriaRepository } from "../../domain/repositories/CategoriaRepository";
import { ConflictError } from "../../domain/exceptions/DomainError";

export interface CrearCategoriaInput {
  nombre: string;
  requiereMedidasFisicas: boolean;
}

export class CrearCategoriaUseCase {
  constructor(private readonly categoriaRepository: CategoriaRepository) {}

  public async execute(input: CrearCategoriaInput): Promise<Categoria> {
    // "nombre" es @unique en la base — sin este chequeo, cargar una categoría
    // repetida rompía con un error crudo de Postgres en vez de un mensaje claro.
    const existente = await this.categoriaRepository.findByNombre(input.nombre);
    if (existente) {
      throw new ConflictError(`Ya existe una categoría llamada "${input.nombre}".`);
    }
    const categoria = Categoria.create({ id: randomUUID(), ...input });
    await this.categoriaRepository.save(categoria);
    return categoria;
  }
}
