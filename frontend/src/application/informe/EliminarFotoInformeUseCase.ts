import { InformeRepository } from "../../domain/repositories/InformeRepository";

export class EliminarFotoInformeUseCase {
  constructor(private readonly informeRepository: InformeRepository) {}

  execute(fotoId: string): Promise<void> {
    return this.informeRepository.eliminarFoto(fotoId);
  }
}
