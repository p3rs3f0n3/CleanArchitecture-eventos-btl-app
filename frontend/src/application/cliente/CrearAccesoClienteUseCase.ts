import { ClienteRepository } from "../../domain/repositories/ClienteRepository";

export class CrearAccesoClienteUseCase {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  execute(clienteId: string, email: string, password: string) {
    return this.clienteRepository.crearAcceso(clienteId, email, password);
  }
}
