import { randomUUID } from "node:crypto";
import { Usuario, RolSistema } from "../../domain/entities/Usuario";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { PasswordHasher } from "../../domain/services/PasswordHasher";
import { ConflictError } from "../../domain/exceptions/DomainError";

export interface RegisterInput {
  email: string;
  password: string;
  rol: RolSistema;
  clienteId?: string;
  personalId?: string;
}

export class RegisterUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async execute(input: RegisterInput): Promise<Usuario> {
    const existentePorEmail = await this.usuarioRepository.findByEmail(input.email);
    if (existentePorEmail) {
      throw new ConflictError(`Ya existe un usuario registrado con el correo "${input.email}".`);
    }

    // clienteId/personalId son @unique en la base — sin este chequeo, un
    // segundo intento de "crear acceso" para el mismo Cliente/Personal
    // rompía con un error crudo de Postgres en vez de un mensaje claro.
    if (input.clienteId) {
      const existentePorCliente = await this.usuarioRepository.findByClienteId(input.clienteId);
      if (existentePorCliente) {
        throw new ConflictError(`Este cliente ya tiene una cuenta de acceso asociada (${existentePorCliente.email}).`);
      }
    }
    if (input.personalId) {
      const existentePorPersonal = await this.usuarioRepository.findByPersonalId(input.personalId);
      if (existentePorPersonal) {
        throw new ConflictError(`Esta persona ya tiene una cuenta de acceso asociada (${existentePorPersonal.email}).`);
      }
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const usuario = Usuario.create({
      id: randomUUID(),
      email: input.email,
      passwordHash,
      rol: input.rol,
      clienteId: input.clienteId,
      personalId: input.personalId,
    });

    await this.usuarioRepository.save(usuario);
    return usuario;
  }
}
