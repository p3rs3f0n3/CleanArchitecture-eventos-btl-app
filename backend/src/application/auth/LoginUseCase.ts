import { Usuario } from "../../domain/entities/Usuario";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { PasswordHasher } from "../../domain/services/PasswordHasher";
import { TokenGenerator } from "../../domain/services/TokenGenerator";
import { UnauthorizedError } from "../../domain/exceptions/DomainError";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  token: string;
  usuario: Usuario;
}

export class LoginUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  public async execute(input: LoginInput): Promise<LoginOutput> {
    const usuario = await this.usuarioRepository.findByEmail(input.email);
    // OJO: mensaje genérico a propósito en ambos casos (usuario no existe / password incorrecta)
    // para no revelar a un atacante si el correo existe en el sistema.
    if (!usuario) {
      throw new UnauthorizedError('Credenciales inválidas.');
    }

    const passwordValida = await this.passwordHasher.compare(input.password, usuario.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedError('Credenciales inválidas.');
    }

    if (!usuario.activo) {
      throw new UnauthorizedError('Tu cuenta está bloqueada. Contactá a un administrador.');
    }

    const token = this.tokenGenerator.generate({
      usuarioId: usuario.id,
      rol: usuario.rol,
      clienteId: usuario.clienteId,
      personalId: usuario.personalId,
    });
    return { token, usuario };
  }
}
