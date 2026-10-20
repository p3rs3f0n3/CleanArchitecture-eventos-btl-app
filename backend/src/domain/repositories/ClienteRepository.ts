import { Cliente } from "../entities/Cliente";

export interface ClienteRepository {
  findById(id: string): Promise<Cliente | null>;
  findAll(): Promise<Cliente[]>;
  save(cliente: Cliente): Promise<void>;
  /** Persiste TODOS los campos editables (datos + activo) del cliente ya modificado en memoria. */
  actualizar(cliente: Cliente): Promise<void>;
}
