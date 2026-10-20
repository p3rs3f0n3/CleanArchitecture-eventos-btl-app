import { ApiClient } from "../http/ApiClient";
import { EventoRepository, CrearEventoData } from "../../domain/repositories/EventoRepository";
import { Evento, EstadoEvento } from "../../domain/entities/Evento";

export class ApiEventoRepository implements EventoRepository {
  listarPorCliente(clienteId: string): Promise<Evento[]> {
    return ApiClient.get<Evento[]>(`/eventos/cliente/${clienteId}`);
  }

  listarAsignados(): Promise<Evento[]> {
    return ApiClient.get<Evento[]>('/eventos/asignados');
  }

  crear(data: CrearEventoData): Promise<Evento> {
    return ApiClient.post<Evento>('/eventos', data);
  }

  cambiarEstado(eventoId: string, nuevoEstado: EstadoEvento, evidencia: { fotoUrl?: string; observacion?: string }): Promise<Evento> {
    return ApiClient.patch<Evento>(`/eventos/${eventoId}/estado`, { nuevoEstado, ...evidencia });
  }

  subirImagen(eventoId: string, archivo: File): Promise<Evento> {
    const formData = new FormData();
    formData.append('imagen', archivo);
    return ApiClient.postFormData<Evento>(`/eventos/${eventoId}/imagen`, formData);
  }
}
