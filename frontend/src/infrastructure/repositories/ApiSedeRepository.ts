import { ApiClient } from "../http/ApiClient";
import { SedeRepository } from "../../domain/repositories/SedeRepository";
import { Sede } from "../../domain/entities/Sede";

export class ApiSedeRepository implements SedeRepository {
  crear(eventoId: string, data: Omit<Sede, 'id' | 'eventoId' | 'createdAt'>): Promise<Sede> {
    return ApiClient.post<Sede>(`/eventos/${eventoId}/sedes`, data);
  }

  listarPorEvento(eventoId: string): Promise<Sede[]> {
    return ApiClient.get<Sede[]>(`/eventos/${eventoId}/sedes`);
  }
}
