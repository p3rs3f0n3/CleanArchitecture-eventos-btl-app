import { Informe, EstadoInforme } from "../../domain/entities/Informe";
import { FotoInforme } from "../../domain/entities/FotoInforme";
import { EntradaInforme } from "../../domain/entities/EntradaInforme";
import { InformeRepository } from "../../domain/repositories/InformeRepository";
import { FotoInformeRepository } from "../../domain/repositories/FotoInformeRepository";
import { EntradaInformeRepository } from "../../domain/repositories/EntradaInformeRepository";
import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { AsignacionEventoRepository } from "../../domain/repositories/AsignacionEventoRepository";
import { RolSistema } from "../../domain/entities/Usuario";
import { resolverPermisoInforme } from "./permisosInforme";

/** Lo que devuelve cualquier acción sobre el Informe: cabecera + fotos + entradas (cronológicas). */
export interface InformeCompleto {
  informe: Informe;
  fotos: FotoInforme[];
  entradas: EntradaInforme[];
}

/**
 * Devuelve null tanto si el informe no existe todavía como si quien
 * pregunta no tiene por qué verlo — el CLIENTE solo lo ve una vez
 * PUBLICADO; Coordinador/Productor solo si son dueño/asignado de ESE evento.
 */
export class ObtenerInformePorEventoUseCase {
  constructor(
    private readonly informeRepository: InformeRepository,
    private readonly fotoInformeRepository: FotoInformeRepository,
    private readonly entradaInformeRepository: EntradaInformeRepository,
    private readonly eventoRepository: EventoRepository,
    private readonly usuarioRepository: UsuarioRepository,
    private readonly asignacionEventoRepository: AsignacionEventoRepository,
  ) {}

  public async execute(eventoId: string, usuarioId: string, rol: RolSistema): Promise<InformeCompleto | null> {
    const informe = await this.informeRepository.findByEventoId(eventoId);
    if (!informe) {
      return null;
    }

    if (rol === RolSistema.CLIENTE) {
      if (informe.estado !== EstadoInforme.PUBLICADO) {
        return null;
      }
    } else if (rol === RolSistema.COORDINADOR || rol === RolSistema.PRODUCTOR) {
      const permiso = await resolverPermisoInforme(
        { eventoRepository: this.eventoRepository, usuarioRepository: this.usuarioRepository, asignacionEventoRepository: this.asignacionEventoRepository },
        eventoId,
        usuarioId,
        rol,
      );
      if (!permiso) {
        return null;
      }
    }
    // ADMIN no gestiona eventos, pero si llegara a preguntar, no hay razón de negocio para ocultárselo.

    const fotos = await this.fotoInformeRepository.findByInformeId(informe.id);
    const entradas = await this.entradaInformeRepository.findByInformeId(informe.id);
    return { informe, fotos, entradas };
  }
}
