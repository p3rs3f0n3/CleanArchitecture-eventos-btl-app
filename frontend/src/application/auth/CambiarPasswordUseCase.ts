import { AuthRepository } from "../../domain/repositories/AuthRepository";

export class CambiarPasswordUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(passwordActual: string, passwordNueva: string): Promise<void> {
    return this.authRepository.cambiarPassword(passwordActual, passwordNueva);
  }
}
