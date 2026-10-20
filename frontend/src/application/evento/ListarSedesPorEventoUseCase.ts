import { SedeRepository } from "../../domain/repositories/SedeRepository";
import { Sede } from "../../domain/entities/Sede";

export class ListarSedesPorEventoUseCase {
  constructor(private readonly sedeRepository: SedeRepository) {}

  execute(eventoId: string): Promise<Sede[]> {
    return this.sedeRepository.listarPorEvento(eventoId);
  }
}
