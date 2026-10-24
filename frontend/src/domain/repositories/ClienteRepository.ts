import { Cliente } from "../entities/Cliente";

export type ClienteInput = Omit<Cliente, 'id' | 'createdAt' | 'activo'>;

export interface ClienteRepository {
  listar(): Promise<Cliente[]>;
  /** SOLO CLIENTE — resuelve el propio registro, sin poder listar a los demás. */
  obtenerPropio(): Promise<Cliente>;
  crear(data: ClienteInput): Promise<Cliente>;
  /** SOLO ADMIN */
  actualizar(clienteId: string, data: ClienteInput): Promise<Cliente>;
  /** SOLO ADMIN */
  cambiarEstadoActivo(clienteId: string, activo: boolean): Promise<Cliente>;
  /** SOLO ADMIN: le da a un Cliente ya existente sus credenciales de acceso. */
  crearAcceso(clienteId: string, email: string, password: string): Promise<{ id: string; email: string; rol: string }>;
}
