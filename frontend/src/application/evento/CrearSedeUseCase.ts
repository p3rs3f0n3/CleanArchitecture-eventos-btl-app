import { SedeRepository } from "../../domain/repositories/SedeRepository";
import { Sede } from "../../domain/entities/Sede";

export class CrearSedeUseCase {
  constructor(private readonly sedeRepository: SedeRepository) {}

  execute(eventoId: string, data: Omit<Sede, 'id' | 'eventoId' | 'createdAt'>): Promise<Sede> {
    return this.sedeRepository.crear(eventoId, data);
  }
}
