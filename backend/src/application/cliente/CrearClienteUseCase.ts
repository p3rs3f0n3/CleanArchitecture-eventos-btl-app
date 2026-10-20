import { randomUUID } from "node:crypto";
import { Cliente } from "../../domain/entities/Cliente";
import { ClienteRepository } from "../../domain/repositories/ClienteRepository";

export interface CrearClienteInput {
  nombreEmpresa: string;
  contactoNombre: string;
  contactoEmail: string;
  contactoTelefono: string;
  direccion: string;
}

export class CrearClienteUseCase {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  public async execute(input: CrearClienteInput): Promise<Cliente> {
    const cliente = Cliente.create({ id: randomUUID(), ...input });
    await this.clienteRepository.save(cliente);
    return cliente;
  }
}
