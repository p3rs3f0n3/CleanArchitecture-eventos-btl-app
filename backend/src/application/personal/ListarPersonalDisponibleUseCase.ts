import { Personal } from "../../domain/entities/Personal";
import { PersonalRepository } from "../../domain/repositories/PersonalRepository";
import { AsignacionEventoRepository } from "../../domain/repositories/AsignacionEventoRepository";
import { haySolapamiento } from "../shared/solapamiento";

export interface ListarPersonalDisponibleInput {
  fechaInicio: Date;
  fechaFin: Date;
}

/** Reutiliza la MISMA regla de cruce de horario que AsignarPersonalAEventoUseCase,
 *  pero para responder "¿quién está libre en este rango?" en vez de validar una asignación puntual. */
export class ListarPersonalDisponibleUseCase {
  constructor(
    private readonly personalRepository: PersonalRepository,
    private readonly asignacionEventoRepository: AsignacionEventoRepository,
  ) {}

  public async execute(input: ListarPersonalDisponibleInput): Promise<Personal[]> {
    const todoElPersonal = await this.personalRepository.findAll();
    const disponibles: Personal[] = [];

    for (const personal of todoElPersonal) {
      const eventosAsignados = await this.asignacionEventoRepository.findEventosAsignadosByPersonalId(personal.id);
      const tieneConflicto = eventosAsignados.some((eventoAsignado) =>
        haySolapamiento(input.fechaInicio, input.fechaFin, eventoAsignado.fechaInicio, eventoAsignado.fechaFin),
      );
      if (!tieneConflicto) {
        disponibles.push(personal);
      }
    }

    return disponibles;
  }
}
