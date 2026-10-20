import { InformeRepository } from "../../domain/repositories/InformeRepository";
import { Informe } from "../../domain/entities/Informe";

export class MarcarInformeAjustadoUseCase {
  constructor(private readonly informeRepository: InformeRepository) {}

  execute(eventoId: string): Promise<Informe> {
    return this.informeRepository.marcarAjustado(eventoId);
  }
}
