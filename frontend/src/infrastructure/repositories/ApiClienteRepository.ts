import { ApiClient } from "../http/ApiClient";
import { ClienteRepository, ClienteInput } from "../../domain/repositories/ClienteRepository";
import { Cliente } from "../../domain/entities/Cliente";

export class ApiClienteRepository implements ClienteRepository {
  listar(): Promise<Cliente[]> {
    return ApiClient.get<Cliente[]>('/clientes');
  }

  crear(data: ClienteInput): Promise<Cliente> {
    return ApiClient.post<Cliente>('/clientes', data);
  }

  actualizar(clienteId: string, data: ClienteInput): Promise<Cliente> {
    return ApiClient.patch<Cliente>(`/clientes/${clienteId}`, data);
  }

  cambiarEstadoActivo(clienteId: string, activo: boolean): Promise<Cliente> {
    return ApiClient.patch<Cliente>(`/clientes/${clienteId}/estado`, { activo });
  }

  crearAcceso(clienteId: string, email: string, password: string): Promise<{ id: string; email: string; rol: string }> {
    return ApiClient.post(`/clientes/${clienteId}/usuario`, { email, password });
  }
}
