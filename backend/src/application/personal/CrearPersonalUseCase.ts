import { randomUUID } from "node:crypto";
import { Personal, Sexo } from "../../domain/entities/Personal";
import { PersonalRepository } from "../../domain/repositories/PersonalRepository";
import { CategoriaRepository } from "../../domain/repositories/CategoriaRepository";
import { NotFoundError, InvalidPropValueError } from "../../domain/exceptions/DomainError";

export interface CrearPersonalInput {
  nombreCompleto: string;
  documento: string;
  telefono: string;
  sexo: Sexo;
  direccion: string;
  categoriaId: string;
  medidas?: string;
  peso?: number;
  estatura?: number;
  tallaRopa?: string;
}

export class CrearPersonalUseCase {
  constructor(
    private readonly personalRepository: PersonalRepository,
    private readonly categoriaRepository: CategoriaRepository,
  ) {}

  public async execute(input: CrearPersonalInput): Promise<Personal> {
    const categoria = await this.categoriaRepository.findById(input.categoriaId);
    if (!categoria) {
      throw new NotFoundError(`No existe una categoría con id "${input.categoriaId}".`);
    }

    // Regla cruzada Categoria <-> Personal: vive acá (caso de uso), no en la
    // entidad Personal, porque necesita consultar OTRA entidad para decidir.
    if (categoria.requiereMedidasFisicas) {
      const faltanDatos = !input.medidas || input.peso === undefined || input.estatura === undefined || !input.tallaRopa;
      if (faltanDatos) {
        throw new InvalidPropValueError(
          `La categoría "${categoria.nombre}" requiere medidas físicas (medidas, peso, estatura y talla de ropa).`,
        );
      }
    }

    const personal = Personal.create({ id: randomUUID(), ...input });
    await this.personalRepository.save(personal);
    return personal;
  }
}
