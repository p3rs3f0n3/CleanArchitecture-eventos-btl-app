import { ClienteRepository, ClienteInput } from "../../domain/repositories/ClienteRepository";
import { Cliente } from "../../domain/entities/Cliente";

export class CrearClienteUseCase {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  execute(data: ClienteInput): Promise<Cliente> {
    return this.clienteRepository.crear(data);
  }
}
