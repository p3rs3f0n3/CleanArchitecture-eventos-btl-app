import { PersonalRepository } from "../../domain/repositories/PersonalRepository";
import { AsignacionEvento, TipoParticipacion } from "../../domain/entities/AsignacionEvento";

export class AsignarPersonalAEventoUseCase {
  constructor(private readonly personalRepository: PersonalRepository) {}

  execute(eventoId: string, personalId: string, tipoParticipacion: TipoParticipacion): Promise<AsignacionEvento> {
    return this.personalRepository.asignarAEvento(eventoId, personalId, tipoParticipacion);
  }
}
