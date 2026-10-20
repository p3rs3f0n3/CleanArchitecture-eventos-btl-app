import { InformeRepository } from "../../domain/repositories/InformeRepository";
import { FotoInforme } from "../../domain/entities/Informe";

export class AgregarFotoInformeUseCase {
  constructor(private readonly informeRepository: InformeRepository) {}

  execute(eventoId: string, archivo: File): Promise<FotoInforme> {
    return this.informeRepository.agregarFoto(eventoId, archivo);
  }
}
