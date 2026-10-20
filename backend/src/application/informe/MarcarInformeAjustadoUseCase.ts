import { InformeRepository } from "../../domain/repositories/InformeRepository";
import { FotoInformeRepository } from "../../domain/repositories/FotoInformeRepository";
import { EntradaInformeRepository } from "../../domain/repositories/EntradaInformeRepository";
import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { AsignacionEventoRepository } from "../../domain/repositories/AsignacionEventoRepository";
import { RolSistema } from "../../domain/entities/Usuario";
import { NotFoundError, UnauthorizedError } from "../../domain/exceptions/DomainError";
import { resolverPermisoInforme } from "./permisosInforme";
import { InformeCompleto } from "./ObtenerInformePorEventoUseCase";

/** SOLO el Coordinador dueño del evento — ENVIADO → AJUSTADO, después de revisar lo que mandó el Productor. */
export class MarcarInformeAjustadoUseCase {
  constructor(
    private readonly informeRepository: InformeRepository,
    private readonly fotoInformeRepository: FotoInformeRepository,
    private readonly entradaInformeRepository: EntradaInformeRepository,
    private readonly eventoRepository: EventoRepository,
    private readonly usuarioRepository: UsuarioRepository,
    private readonly asignacionEventoRepository: AsignacionEventoRepository,
  ) {}

  public async execute(eventoId: string, usuarioId: string, rol: RolSistema): Promise<InformeCompleto> {
    const informe = await this.informeRepository.findByEventoId(eventoId);
    if (!informe) {
      throw new NotFoundError(`Este evento todavía no tiene un informe cargado.`);
    }
    const permiso = await resolverPermisoInforme(
      { eventoRepository: this.eventoRepository, usuarioRepository: this.usuarioRepository, asignacionEventoRepository: this.asignacionEventoRepository },
      eventoId,
      usuarioId,
      rol,
    );
    if (permiso !== 'COORDINADOR_DUENO') {
      throw new UnauthorizedError('Solo el Coordinador dueño de este evento puede marcar el informe como ajustado.');
    }
    informe.marcarAjustado(usuarioId);
    await this.informeRepository.update(informe);
    const fotos = await this.fotoInformeRepository.findByInformeId(informe.id);
    const entradas = await this.entradaInformeRepository.findByInformeId(informe.id);
    return { informe, fotos, entradas };
  }
}
