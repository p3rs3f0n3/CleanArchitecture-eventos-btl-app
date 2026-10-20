import { ClienteRepository } from "../../domain/repositories/ClienteRepository";
import { Cliente } from "../../domain/entities/Cliente";

export class CambiarEstadoActivoClienteUseCase {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  execute(clienteId: string, activo: boolean): Promise<Cliente> {
    return this.clienteRepository.cambiarEstadoActivo(clienteId, activo);
  }
}
