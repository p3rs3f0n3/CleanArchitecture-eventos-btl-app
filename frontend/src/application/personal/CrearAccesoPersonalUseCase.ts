import { PersonalRepository } from "../../domain/repositories/PersonalRepository";

export class CrearAccesoPersonalUseCase {
  constructor(private readonly personalRepository: PersonalRepository) {}

  execute(personalId: string, email: string, password: string, rol: 'COORDINADOR' | 'PRODUCTOR') {
    return this.personalRepository.crearAcceso(personalId, email, password, rol);
  }
}
