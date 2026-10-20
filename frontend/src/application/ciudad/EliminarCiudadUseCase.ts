import { CiudadRepository } from "../../domain/repositories/CiudadRepository";

export class EliminarCiudadUseCase {
  constructor(private readonly ciudadRepository: CiudadRepository) {}

  execute(id: string): Promise<void> {
    return this.ciudadRepository.eliminar(id);
  }
}
