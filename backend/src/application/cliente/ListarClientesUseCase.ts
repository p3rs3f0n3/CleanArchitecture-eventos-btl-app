import { Cliente } from "../../domain/entities/Cliente";
import { ClienteRepository } from "../../domain/repositories/ClienteRepository";

export class ListarClientesUseCase {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  public async execute(): Promise<Cliente[]> {
    return this.clienteRepository.findAll();
  }
}
