import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { AsignacionEventoRepository } from "../../domain/repositories/AsignacionEventoRepository";
import { RolSistema } from "../../domain/entities/Usuario";
import { TipoParticipacion } from "../../domain/entities/AsignacionEvento";
import { Informe, EstadoInforme } from "../../domain/entities/Informe";
import { UnauthorizedError } from "../../domain/exceptions/DomainError";

export type PermisoInforme = 'COORDINADOR_DUENO' | 'PRODUCTOR_ASIGNADO' | null;

export interface DepsPermisoInforme {
  eventoRepository: EventoRepository;
  usuarioRepository: UsuarioRepository;
  asignacionEventoRepository: AsignacionEventoRepository;
}

/**
 * Resuelve, para un evento puntual, si quien pregunta es el COORDINADOR
 * dueño (el que lo creó) o el PRODUCTOR asignado como responsable — las
 * únicas dos identidades con algo que hacer sobre el Informe de un evento.
 */
export async function resolverPermisoInforme(
  deps: DepsPermisoInforme,
  eventoId: string,
  usuarioId: string,
  rol: RolSistema,
): Promise<PermisoInforme> {
  if (rol === RolSistema.COORDINADOR) {
    const evento = await deps.eventoRepository.findById(eventoId);
    return evento?.creadoPorId === usuarioId ? 'COORDINADOR_DUENO' : null;
  }
  if (rol === RolSistema.PRODUCTOR) {
    const usuario = await deps.usuarioRepository.findById(usuarioId);
    if (!usuario?.personalId) return null;
    const asignaciones = await deps.asignacionEventoRepository.findByPersonalId(usuario.personalId);
    const asignado = asignaciones.some(
      (a) => a.eventoId === eventoId && a.tipoParticipacion === TipoParticipacion.PRODUCTOR,
    );
    return asignado ? 'PRODUCTOR_ASIGNADO' : null;
  }
  return null;
}

/**
 * Reglas de edición del Informe (entradas y fotos, que se suman igual):
 * - No existe todavía: SOLO el Productor asignado puede arrancarlo.
 * - BORRADOR: Productor asignado O Coordinador dueño pueden sumar.
 * - ENVIADO / AJUSTADO: SOLO el Coordinador dueño. El Productor ya cerró su parte.
 * - PUBLICADO: nadie.
 */
export function validarPuedeEditarInforme(informe: Informe | null, permiso: PermisoInforme): void {
  if (!informe) {
    if (permiso !== 'PRODUCTOR_ASIGNADO') {
      throw new UnauthorizedError('Solo el Productor asignado a este evento puede crear el informe.');
    }
    return;
  }
  informe.assertEditable();
  if (informe.estado === EstadoInforme.BORRADOR) {
    if (!permiso) {
      throw new UnauthorizedError('No tenés permiso para editar este informe.');
    }
    return;
  }
  // ENVIADO o AJUSTADO: el Productor ya no puede tocarlo.
  if (permiso !== 'COORDINADOR_DUENO') {
    throw new UnauthorizedError('El informe ya fue enviado al Coordinador: solo él puede seguir editándolo.');
  }
}
