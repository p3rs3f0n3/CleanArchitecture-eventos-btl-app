import { InformeRepository } from "../../domain/repositories/InformeRepository";
import { Informe } from "../../domain/entities/Informe";

export class EnviarInformeUseCase {
  constructor(private readonly informeRepository: InformeRepository) {}

  execute(eventoId: string): Promise<Informe> {
    return this.informeRepository.enviar(eventoId);
  }
}
