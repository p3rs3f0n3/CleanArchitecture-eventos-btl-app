import { Evento } from "../../domain/entities/Evento";
import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { AsignacionEventoRepository } from "../../domain/repositories/AsignacionEventoRepository";
import { TipoParticipacion } from "../../domain/entities/AsignacionEvento";

/**
 * "Mis eventos" del PRODUCTOR (ver eventoRoutes.ts) — a diferencia de
 * ListarEventosPorClienteUseCase, acá NO se parte de un cliente: el
 * Productor puede tener eventos asignados de clientes distintos, y ya no
 * tiene la pestaña "Clientes" para elegir uno primero.
 */
export class ListarEventosAsignadosUseCase {
  constructor(
    private readonly eventoRepository: EventoRepository,
    private readonly usuarioRepository: UsuarioRepository,
    private readonly asignacionEventoRepository: AsignacionEventoRepository,
  ) {}

  public async execute(usuarioId: string): Promise<Evento[]> {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario?.personalId) {
      return [];
    }
    const asignaciones = await this.asignacionEventoRepository.findByPersonalId(usuario.personalId);
    const eventoIds = asignaciones
      .filter((a) => a.tipoParticipacion === TipoParticipacion.PRODUCTOR)
      .map((a) => a.eventoId);
    return this.eventoRepository.findByIds(eventoIds);
  }
}
