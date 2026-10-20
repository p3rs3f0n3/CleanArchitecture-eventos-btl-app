import { Evento } from "../../domain/entities/Evento";
import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { AsignacionEventoRepository } from "../../domain/repositories/AsignacionEventoRepository";
import { RolSistema } from "../../domain/entities/Usuario";
import { TipoParticipacion } from "../../domain/entities/AsignacionEvento";

export interface ListarEventosPorClienteInput {
  clienteId: string;
  /** Quién pregunta — determina el filtro (ver comentario abajo). */
  usuarioId: string;
  rol: RolSistema;
}

/**
 * Decisión de Nelly: cada rol ve un subconjunto distinto de los eventos de
 * un cliente — el COORDINADOR solo los que ÉL creó, el PRODUCTOR solo los
 * que le asignaron como responsable. ADMIN/CLIENTE ven todos (ADMIN no
 * gestiona eventos de todas formas; CLIENTE quiere ver todo lo suyo).
 */
export class ListarEventosPorClienteUseCase {
  constructor(
    private readonly eventoRepository: EventoRepository,
    private readonly usuarioRepository: UsuarioRepository,
    private readonly asignacionEventoRepository: AsignacionEventoRepository,
  ) {}

  public async execute(input: ListarEventosPorClienteInput): Promise<Evento[]> {
    const eventos = await this.eventoRepository.findByClienteId(input.clienteId);

    if (input.rol === RolSistema.COORDINADOR) {
      // Los eventos de ANTES de que existiera creadoPorId no tienen dueño
      // registrado — se muestran a cualquier Coordinador (fallback de
      // compatibilidad) en vez de quedar invisibles para todos. El filtro
      // estricto ("solo lo que YO creé") aplica únicamente a partir de acá,
      // para los eventos que sí tienen un creador guardado.
      return eventos.filter((e) => !e.creadoPorId || e.creadoPorId === input.usuarioId);
    }

    if (input.rol === RolSistema.PRODUCTOR) {
      const usuario = await this.usuarioRepository.findById(input.usuarioId);
      if (!usuario?.personalId) {
        return [];
      }
      const asignaciones = await this.asignacionEventoRepository.findByPersonalId(usuario.personalId);
      const eventoIdsAsignados = new Set(
        asignaciones.filter((a) => a.tipoParticipacion === TipoParticipacion.PRODUCTOR).map((a) => a.eventoId),
      );
      return eventos.filter((e) => eventoIdsAsignados.has(e.id));
    }

    return eventos;
  }
}
