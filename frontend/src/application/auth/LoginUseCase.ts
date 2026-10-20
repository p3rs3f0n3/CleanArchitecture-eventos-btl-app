import { AuthRepository, LoginResult } from "../../domain/repositories/AuthRepository";

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(email: string, password: string): Promise<LoginResult> {
    return this.authRepository.login(email, password);
  }
}
