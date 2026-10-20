import { Cliente } from "../../domain/entities/Cliente";
import { ClienteRepository } from "../../domain/repositories/ClienteRepository";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { NotFoundError } from "../../domain/exceptions/DomainError";

/**
 * SOLO ADMIN — activar/desactivar un cliente. Un cliente inactivo no debería
 * recibir eventos nuevos. CASCADA: si el cliente tiene una cuenta de acceso
 * (Usuario), esa cuenta se bloquea/desbloquea junto con el cliente — no
 * tendría sentido que alguien siga pudiendo loguearse por un cliente inactivo.
 */
export class CambiarEstadoActivoClienteUseCase {
  constructor(
    private readonly clienteRepository: ClienteRepository,
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async execute(clienteId: string, activo: boolean): Promise<Cliente> {
    const cliente = await this.clienteRepository.findById(clienteId);
    if (!cliente) {
      throw new NotFoundError(`No existe un cliente con id "${clienteId}".`);
    }
    cliente.cambiarEstadoActivo(activo);
    await this.clienteRepository.actualizar(cliente);

    const usuario = await this.usuarioRepository.findByClienteId(clienteId);
    if (usuario) {
      await this.usuarioRepository.actualizarEstadoActivo(usuario.id, activo);
    }

    return cliente;
  }
}
