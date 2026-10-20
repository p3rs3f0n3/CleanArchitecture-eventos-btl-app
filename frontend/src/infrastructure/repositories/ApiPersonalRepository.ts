import { ApiClient } from "../http/ApiClient";
import { PersonalRepository, PersonalInput } from "../../domain/repositories/PersonalRepository";
import { Personal } from "../../domain/entities/Personal";
import { AsignacionEvento, TipoParticipacion } from "../../domain/entities/AsignacionEvento";

export class ApiPersonalRepository implements PersonalRepository {
  crear(data: PersonalInput): Promise<Personal> {
    return ApiClient.post<Personal>('/personal', data);
  }

  listarTodos(): Promise<Personal[]> {
    return ApiClient.get<Personal[]>('/personal');
  }

  listarDisponibles(fechaInicio: string, fechaFin: string): Promise<Personal[]> {
    const params = new URLSearchParams({ fechaInicio, fechaFin });
    return ApiClient.get<Personal[]>(`/personal/disponibles?${params.toString()}`);
  }

  asignarAEvento(eventoId: string, personalId: string, tipoParticipacion: TipoParticipacion): Promise<AsignacionEvento> {
    return ApiClient.post<AsignacionEvento>('/personal/asignaciones', { eventoId, personalId, tipoParticipacion });
  }

  listarAsignacionesPorEvento(eventoId: string): Promise<AsignacionEvento[]> {
    return ApiClient.get<AsignacionEvento[]>(`/eventos/${eventoId}/asignaciones`);
  }

  crearAcceso(personalId: string, email: string, password: string, rol: 'COORDINADOR' | 'PRODUCTOR') {
    return ApiClient.post<{ id: string; email: string; rol: string }>(`/personal/${personalId}/usuario`, { email, password, rol });
  }

  actualizar(personalId: string, data: PersonalInput): Promise<Personal> {
    return ApiClient.patch<Personal>(`/personal/${personalId}`, data);
  }

  cambiarEstadoActivo(personalId: string, activo: boolean): Promise<Personal> {
    return ApiClient.patch<Personal>(`/personal/${personalId}/estado`, { activo });
  }

  subirFoto(personalId: string, archivo: File): Promise<Personal> {
    const formData = new FormData();
    formData.append('foto', archivo);
    return ApiClient.postFormData<Personal>(`/personal/${personalId}/foto`, formData);
  }
}
