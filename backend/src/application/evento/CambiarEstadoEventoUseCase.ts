import { randomUUID } from "node:crypto";
import { Evento, EstadoEvento } from "../../domain/entities/Evento";
import { Reporte, MomentoReporte } from "../../domain/entities/Reporte";
import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { ReporteRepository } from "../../domain/repositories/ReporteRepository";
import { ClienteRepository } from "../../domain/repositories/ClienteRepository";
import { NotFoundError, ConflictError } from "../../domain/exceptions/DomainError";

export interface CambiarEstadoEventoInput {
  eventoId: string;
  nuevoEstado: EstadoEvento;
  fotoUrl?: string;
  observacion?: string;
}

/** Qué estados requieren evidencia obligatoria, y a qué "momento" de Reporte corresponde cada uno. */
const ESTADOS_QUE_REQUIEREN_EVIDENCIA: Partial<Record<EstadoEvento, MomentoReporte>> = {
  [EstadoEvento.INICIADO]: MomentoReporte.INICIO,
  [EstadoEvento.FINALIZADO]: MomentoReporte.FINALIZACION,
};

export class CambiarEstadoEventoUseCase {
  constructor(
    private readonly eventoRepository: EventoRepository,
    private readonly reporteRepository: ReporteRepository,
    private readonly clienteRepository: ClienteRepository,
  ) {}

  public async execute(input: CambiarEstadoEventoInput): Promise<Evento> {
    const evento = await this.eventoRepository.findById(input.eventoId);
    if (!evento) {
      throw new NotFoundError(`No existe un evento con id "${input.eventoId}".`);
    }
    const cliente = await this.clienteRepository.findById(evento.clienteId);
    if (!cliente?.activo) {
      throw new ConflictError(`El cliente dueño de este evento está inactivo. No se pueden hacer cambios en sus eventos.`);
    }

    const momentoRequerido = ESTADOS_QUE_REQUIEREN_EVIDENCIA[input.nuevoEstado];
    if (momentoRequerido) {
      // Reporte.create() ya valida que venga foto y/o observación — si no,
      // tira InvalidPropValueError acá mismo. No duplicamos esa validación.
      const reporte = Reporte.create({
        id: randomUUID(),
        eventoId: evento.id,
        momento: momentoRequerido,
        fotoUrl: input.fotoUrl,
        observacion: input.observacion,
      });
      await this.reporteRepository.save(reporte);
    }

    evento.cambiarEstado(input.nuevoEstado);
    await this.eventoRepository.update(evento);
    return evento;
  }
}
