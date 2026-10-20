import { Ciudad } from "../../domain/entities/Ciudad";
import { CiudadRepository } from "../../domain/repositories/CiudadRepository";

export class ListarCiudadesUseCase {
  constructor(private readonly ciudadRepository: CiudadRepository) {}

  execute(): Promise<Ciudad[]> {
    return this.ciudadRepository.findAll();
  }
}
