import { AuthRepository, RegisterData } from "../../domain/repositories/AuthRepository";
import { Usuario } from "../../domain/entities/Usuario";

export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(data: RegisterData): Promise<Usuario> {
    return this.authRepository.register(data);
  }
}
