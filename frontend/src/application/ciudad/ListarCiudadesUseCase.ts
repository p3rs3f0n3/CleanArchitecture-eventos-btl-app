import { CiudadRepository } from "../../domain/repositories/CiudadRepository";
import { Ciudad } from "../../domain/entities/Ciudad";

export class ListarCiudadesUseCase {
  constructor(private readonly ciudadRepository: CiudadRepository) {}

  execute(): Promise<Ciudad[]> {
    return this.ciudadRepository.listar();
  }
}
