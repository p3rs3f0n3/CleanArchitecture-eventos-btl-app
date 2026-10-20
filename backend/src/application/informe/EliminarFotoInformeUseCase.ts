import { InformeRepository } from "../../domain/repositories/InformeRepository";
import { FotoInformeRepository } from "../../domain/repositories/FotoInformeRepository";
import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { AsignacionEventoRepository } from "../../domain/repositories/AsignacionEventoRepository";
import { RolSistema } from "../../domain/entities/Usuario";
import { NotFoundError } from "../../domain/exceptions/DomainError";
import { resolverPermisoInforme, validarPuedeEditarInforme } from "./permisosInforme";

export interface EliminarFotoInformeInput {
  fotoId: string;
  usuarioId: string;
  rol: RolSistema;
}

export class EliminarFotoInformeUseCase {
  constructor(
    private readonly informeRepository: InformeRepository,
    private readonly fotoInformeRepository: FotoInformeRepository,
    private readonly eventoRepository: EventoRepository,
    private readonly usuarioRepository: UsuarioRepository,
    private readonly asignacionEventoRepository: AsignacionEventoRepository,
  ) {}

  public async execute(input: EliminarFotoInformeInput): Promise<void> {
    const foto = await this.fotoInformeRepository.findById(input.fotoId);
    if (!foto) {
      throw new NotFoundError(`No existe una foto con id "${input.fotoId}".`);
    }
    const informe = await this.informeRepository.findById(foto.informeId);
    if (!informe) {
      throw new NotFoundError(`No existe el informe dueño de esta foto.`);
    }

    const permiso = await resolverPermisoInforme(
      { eventoRepository: this.eventoRepository, usuarioRepository: this.usuarioRepository, asignacionEventoRepository: this.asignacionEventoRepository },
      informe.eventoId,
      input.usuarioId,
      input.rol,
    );
    validarPuedeEditarInforme(informe, permiso);

    await this.fotoInformeRepository.delete(input.fotoId);
  }
}
