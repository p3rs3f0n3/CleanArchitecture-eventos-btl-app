import { InformeRepository } from "../../domain/repositories/InformeRepository";
import { Informe } from "../../domain/entities/Informe";

export class ObtenerInformePorEventoUseCase {
  constructor(private readonly informeRepository: InformeRepository) {}

  execute(eventoId: string): Promise<Informe | null> {
    return this.informeRepository.obtenerPorEvento(eventoId);
  }
}
