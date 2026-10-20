import { ClienteRepository, ClienteInput } from "../../domain/repositories/ClienteRepository";
import { Cliente } from "../../domain/entities/Cliente";

export class ActualizarClienteUseCase {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  execute(clienteId: string, data: ClienteInput): Promise<Cliente> {
    return this.clienteRepository.actualizar(clienteId, data);
  }
}
