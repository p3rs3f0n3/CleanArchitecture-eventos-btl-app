import { CiudadRepository } from "../../domain/repositories/CiudadRepository";
import { SedeRepository } from "../../domain/repositories/SedeRepository";
import { NotFoundError, ConflictError } from "../../domain/exceptions/DomainError";

/** SOLO ADMIN (ver ciudadRoutes.ts) — borrar una ciudad del catálogo. */
export class EliminarCiudadUseCase {
  constructor(
    private readonly ciudadRepository: CiudadRepository,
    private readonly sedeRepository: SedeRepository,
  ) {}

  public async execute(id: string): Promise<void> {
    const ciudad = await this.ciudadRepository.findById(id);
    if (!ciudad) {
      throw new NotFoundError(`No existe una ciudad con id "${id}".`);
    }
    // La FK sedes.ciudadId es ON DELETE RESTRICT — sin este chequeo, borrar
    // una ciudad en uso rompía con un error crudo de Postgres.
    const sedesQueLaUsan = await this.sedeRepository.findByCiudadId(id);
    if (sedesQueLaUsan.length > 0) {
      throw new ConflictError(
        `No se puede borrar "${ciudad.nombre}": hay ${sedesQueLaUsan.length} punto(s) de evento que la usan.`,
      );
    }
    await this.ciudadRepository.delete(id);
  }
}
