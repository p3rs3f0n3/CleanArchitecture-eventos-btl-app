import { CiudadRepository } from "../../domain/repositories/CiudadRepository";
import { Ciudad } from "../../domain/entities/Ciudad";

export class CrearCiudadUseCase {
  constructor(private readonly ciudadRepository: CiudadRepository) {}

  execute(data: Omit<Ciudad, 'id' | 'createdAt'>): Promise<Ciudad> {
    return this.ciudadRepository.crear(data);
  }
}
