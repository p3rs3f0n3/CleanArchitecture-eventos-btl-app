import { randomUUID } from "node:crypto";
import { Reporte, MomentoReporte } from "../../domain/entities/Reporte";
import { ReporteRepository } from "../../domain/repositories/ReporteRepository";
import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { NotFoundError } from "../../domain/exceptions/DomainError";

export interface CrearReporteInput {
  eventoId: string;
  momento: MomentoReporte;
  fotoUrl?: string;
  observacion?: string;
}

/** Para cargar reportes "DURANTE" el evento, que no disparan un cambio de estado
 *  (a diferencia de INICIO/FINALIZACION, que pasan por CambiarEstadoEventoUseCase). */
export class CrearReporteUseCase {
  constructor(
    private readonly reporteRepository: ReporteRepository,
    private readonly eventoRepository: EventoRepository,
  ) {}

  public async execute(input: CrearReporteInput): Promise<Reporte> {
    const evento = await this.eventoRepository.findById(input.eventoId);
    if (!evento) {
      throw new NotFoundError(`No existe un evento con id "${input.eventoId}".`);
    }

    const reporte = Reporte.create({
      id: randomUUID(),
      eventoId: input.eventoId,
      momento: input.momento,
      fotoUrl: input.fotoUrl,
      observacion: input.observacion,
    });

    await this.reporteRepository.save(reporte);
    return reporte;
  }
}
