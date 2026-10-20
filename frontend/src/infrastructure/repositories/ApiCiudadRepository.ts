import { ApiClient } from "../http/ApiClient";
import { CiudadRepository } from "../../domain/repositories/CiudadRepository";
import { Ciudad } from "../../domain/entities/Ciudad";

export class ApiCiudadRepository implements CiudadRepository {
  listar(): Promise<Ciudad[]> {
    return ApiClient.get<Ciudad[]>('/ciudades');
  }

  crear(data: Omit<Ciudad, 'id' | 'createdAt'>): Promise<Ciudad> {
    return ApiClient.post<Ciudad>('/ciudades', data);
  }

  eliminar(id: string): Promise<void> {
    return ApiClient.delete<void>(`/ciudades/${id}`);
  }
}
