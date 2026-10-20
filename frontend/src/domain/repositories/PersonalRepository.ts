import { Personal } from "../entities/Personal";
import { AsignacionEvento, TipoParticipacion } from "../entities/AsignacionEvento";

export type PersonalInput = Omit<Personal, 'id' | 'createdAt' | 'activo' | 'fotoUrl'>;

export interface PersonalRepository {
  crear(data: PersonalInput): Promise<Personal>;
  listarTodos(): Promise<Personal[]>;
  listarDisponibles(fechaInicio: string, fechaFin: string): Promise<Personal[]>;
  asignarAEvento(eventoId: string, personalId: string, tipoParticipacion: TipoParticipacion): Promise<AsignacionEvento>;
  listarAsignacionesPorEvento(eventoId: string): Promise<AsignacionEvento[]>;
  /** SOLO ADMIN: le da a un Personal ya existente sus credenciales de acceso (rol COORDINADOR o PRODUCTOR). */
  crearAcceso(personalId: string, email: string, password: string, rol: 'COORDINADOR' | 'PRODUCTOR'): Promise<{ id: string; email: string; rol: string }>;
  /** SOLO ADMIN */
  actualizar(personalId: string, data: PersonalInput): Promise<Personal>;
  /** SOLO ADMIN */
  cambiarEstadoActivo(personalId: string, activo: boolean): Promise<Personal>;
  /** ADMIN/COORDINADOR */
  subirFoto(personalId: string, archivo: File): Promise<Personal>;
}
