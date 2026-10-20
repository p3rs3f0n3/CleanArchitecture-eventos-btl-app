import { ClienteRepository } from "../../domain/repositories/ClienteRepository";
import { Cliente } from "../../domain/entities/Cliente";

export class ListarClientesUseCase {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  execute(): Promise<Cliente[]> {
    return this.clienteRepository.listar();
  }
}
