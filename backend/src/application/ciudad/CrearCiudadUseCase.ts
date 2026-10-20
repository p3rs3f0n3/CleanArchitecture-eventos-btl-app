import { randomUUID } from "node:crypto";
import { Ciudad } from "../../domain/entities/Ciudad";
import { CiudadRepository } from "../../domain/repositories/CiudadRepository";
import { ConflictError } from "../../domain/exceptions/DomainError";

export interface CrearCiudadInput {
  nombre: string;
}

/** SOLO ADMIN (ver ciudadRoutes.ts) — el Coordinador solo elige de la lista al cargar un punto/Sede. */
export class CrearCiudadUseCase {
  constructor(private readonly ciudadRepository: CiudadRepository) {}

  public async execute(input: CrearCiudadInput): Promise<Ciudad> {
    // "nombre" es @unique en la base — sin este chequeo, cargar una ciudad
    // repetida rompía con un error crudo de Postgres en vez de un mensaje claro.
    const existente = await this.ciudadRepository.findByNombre(input.nombre);
    if (existente) {
      throw new ConflictError(`Ya existe una ciudad llamada "${input.nombre}".`);
    }
    const ciudad = Ciudad.create({ id: randomUUID(), ...input });
    await this.ciudadRepository.save(ciudad);
    return ciudad;
  }
}
