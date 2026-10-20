import { Personal, Sexo } from "../../domain/entities/Personal";
import { PersonalRepository } from "../../domain/repositories/PersonalRepository";
import { NotFoundError } from "../../domain/exceptions/DomainError";

export interface ActualizarPersonalInput {
  personalId: string;
  nombreCompleto: string;
  telefono: string;
  sexo: Sexo;
  direccion: string;
  categoriaId: string;
  medidas?: string;
  peso?: number;
  estatura?: number;
  tallaRopa?: string;
}

/** SOLO ADMIN — editar los datos de un Personal ya existente (staff o gestión). */
export class ActualizarPersonalUseCase {
  constructor(private readonly personalRepository: PersonalRepository) {}

  async execute(input: ActualizarPersonalInput): Promise<Personal> {
    const personal = await this.personalRepository.findById(input.personalId);
    if (!personal) {
      throw new NotFoundError(`No existe personal con id "${input.personalId}".`);
    }
    personal.actualizarDatos({
      nombreCompleto: input.nombreCompleto,
      telefono: input.telefono,
      sexo: input.sexo,
      direccion: input.direccion,
      categoriaId: input.categoriaId,
      medidas: input.medidas,
      peso: input.peso,
      estatura: input.estatura,
      tallaRopa: input.tallaRopa,
    });
    await this.personalRepository.actualizar(personal);
    return personal;
  }
}
