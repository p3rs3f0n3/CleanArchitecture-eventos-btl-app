import { Cliente } from "../../domain/entities/Cliente";
import { ClienteRepository } from "../../domain/repositories/ClienteRepository";
import { NotFoundError } from "../../domain/exceptions/DomainError";

export interface ActualizarClienteInput {
  clienteId: string;
  nombreEmpresa: string;
  contactoNombre: string;
  contactoEmail: string;
  contactoTelefono: string;
  direccion: string;
}

/** SOLO ADMIN (ver clienteRoutes.ts) — editar los datos de un cliente ya existente. */
export class ActualizarClienteUseCase {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  async execute(input: ActualizarClienteInput): Promise<Cliente> {
    const cliente = await this.clienteRepository.findById(input.clienteId);
    if (!cliente) {
      throw new NotFoundError(`No existe un cliente con id "${input.clienteId}".`);
    }
    cliente.actualizarDatos({
      nombreEmpresa: input.nombreEmpresa,
      contactoNombre: input.contactoNombre,
      contactoEmail: input.contactoEmail,
      contactoTelefono: input.contactoTelefono,
      direccion: input.direccion,
    });
    await this.clienteRepository.actualizar(cliente);
    return cliente;
  }
}
