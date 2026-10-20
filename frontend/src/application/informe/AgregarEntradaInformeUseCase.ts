import { InformeRepository, AgregarEntradaInformeData } from "../../domain/repositories/InformeRepository";
import { Informe } from "../../domain/entities/Informe";

export class AgregarEntradaInformeUseCase {
  constructor(private readonly informeRepository: InformeRepository) {}

  execute(eventoId: string, data: AgregarEntradaInformeData): Promise<Informe> {
    return this.informeRepository.agregarEntrada(eventoId, data);
  }
}
