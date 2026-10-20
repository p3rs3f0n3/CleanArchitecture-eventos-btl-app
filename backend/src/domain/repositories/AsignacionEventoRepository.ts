import { AsignacionEvento } from "../entities/AsignacionEvento";
import { Evento } from "../entities/Evento";

export interface AsignacionEventoRepository {
  save(asignacion: AsignacionEvento): Promise<void>;
  findByEventoId(eventoId: string): Promise<AsignacionEvento[]>;
  /** Para saber a qué eventos está asignada una persona (y con qué tipoParticipacion) — ej: qué eventos ve un Productor. */
  findByPersonalId(personalId: string): Promise<AsignacionEvento[]>;
  /**
   * Devuelve los Eventos COMPLETOS (con sus fechas) a los que esta persona
   * ya está asignada. Se usa desde el caso de uso para detectar cruces de
   * horario — la comparación de fechas es lógica de negocio y vive en el
   * caso de uso, el repositorio solo trae los datos.
   */
  findEventosAsignadosByPersonalId(personalId: string): Promise<Evento[]>;
}
