import { Cliente } from "../../domain/entities/Cliente";
import { ClienteRepository } from "../../domain/repositories/ClienteRepository";
import { NotFoundError } from "../../domain/exceptions/DomainError";

/** SOLO para el propio CLIENTE logueado — resuelve "soy yo" desde el clienteId del token, nunca desde un id que mande el cliente. */
export class ObtenerClientePropioUseCase {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  public async execute(clienteId: string | undefined): Promise<Cliente> {
    if (!clienteId) {
      throw new NotFoundError("Esta cuenta no tiene un cliente asociado.");
    }
    const cliente = await this.clienteRepository.findById(clienteId);
    if (!cliente) {
      throw new NotFoundError("No existe el cliente asociado a esta cuenta.");
    }
    return cliente;
  }
}
