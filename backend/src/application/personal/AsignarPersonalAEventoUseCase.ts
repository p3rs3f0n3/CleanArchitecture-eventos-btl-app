import { AsignacionEvento, TipoParticipacion } from "../../domain/entities/AsignacionEvento";
import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { PersonalRepository } from "../../domain/repositories/PersonalRepository";
import { AsignacionEventoRepository } from "../../domain/repositories/AsignacionEventoRepository";
import { ClienteRepository } from "../../domain/repositories/ClienteRepository";
import { NotFoundError, ConflictError } from "../../domain/exceptions/DomainError";
import { haySolapamiento } from "../shared/solapamiento";

export interface AsignarPersonalInput {
  eventoId: string;
  personalId: string;
  tipoParticipacion: TipoParticipacion;
}

/**
 * Acá vive la regla de negocio que cruza MUCHOS eventos de UNA persona:
 * "no puedo tener a una impulsadora en dos eventos distintos a la misma
 * hora en la misma fecha". No puede vivir en la entidad AsignacionEvento
 * porque necesita consultar TODAS las asignaciones existentes de esa
 * persona — por eso es un caso de uso, no una entidad.
 */
export class AsignarPersonalAEventoUseCase {
  constructor(
    private readonly eventoRepository: EventoRepository,
    private readonly personalRepository: PersonalRepository,
    private readonly asignacionEventoRepository: AsignacionEventoRepository,
    private readonly clienteRepository: ClienteRepository,
  ) {}

  public async execute(input: AsignarPersonalInput): Promise<AsignacionEvento> {
    const evento = await this.eventoRepository.findById(input.eventoId);
    if (!evento) {
      throw new NotFoundError(`No existe un evento con id "${input.eventoId}".`);
    }
    const cliente = await this.clienteRepository.findById(evento.clienteId);
    if (!cliente?.activo) {
      throw new ConflictError(`El cliente dueño de este evento está inactivo. No se pueden hacer cambios en sus eventos.`);
    }

    const personal = await this.personalRepository.findById(input.personalId);
    if (!personal) {
      throw new NotFoundError(`No existe personal con id "${input.personalId}".`);
    }

    const eventosAsignados = await this.asignacionEventoRepository.findEventosAsignadosByPersonalId(input.personalId);

    const eventoEnConflicto = eventosAsignados.find((eventoAsignado) =>
      haySolapamiento(evento.fechaInicio, evento.fechaFin, eventoAsignado.fechaInicio, eventoAsignado.fechaFin),
    );

    if (eventoEnConflicto) {
      throw new ConflictError(
        `"${personal.nombreCompleto}" ya está asignado al evento "${eventoEnConflicto.nombre}" en un horario que se cruza con "${evento.nombre}".`,
      );
    }

    const asignacion = AsignacionEvento.create({
      eventoId: input.eventoId,
      personalId: input.personalId,
      tipoParticipacion: input.tipoParticipacion,
    });

    await this.asignacionEventoRepository.save(asignacion);
    return asignacion;
  }
}
