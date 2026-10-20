import { Sede } from "../../domain/entities/Sede";
import { SedeRepository } from "../../domain/repositories/SedeRepository";

export class ListarSedesPorEventoUseCase {
  constructor(private readonly sedeRepository: SedeRepository) {}

  public execute(eventoId: string): Promise<Sede[]> {
    return this.sedeRepository.findByEventoId(eventoId);
  }
}
