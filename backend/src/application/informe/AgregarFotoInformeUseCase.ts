import { randomUUID } from "node:crypto";
import { Informe } from "../../domain/entities/Informe";
import { FotoInforme } from "../../domain/entities/FotoInforme";
import { InformeRepository } from "../../domain/repositories/InformeRepository";
import { FotoInformeRepository } from "../../domain/repositories/FotoInformeRepository";
import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { AsignacionEventoRepository } from "../../domain/repositories/AsignacionEventoRepository";
import { RolSistema } from "../../domain/entities/Usuario";
import { NotFoundError } from "../../domain/exceptions/DomainError";
import { resolverPermisoInforme, validarPuedeEditarInforme } from "./permisosInforme";

export interface AgregarFotoInformeInput {
  eventoId: string;
  usuarioId: string;
  rol: RolSistema;
  url: string;
}

/** Mismas reglas de edición que el contenido — agregar una foto a la galería del informe cuenta como "editarlo". */
export class AgregarFotoInformeUseCase {
  constructor(
    private readonly informeRepository: InformeRepository,
    private readonly fotoInformeRepository: FotoInformeRepository,
    private readonly eventoRepository: EventoRepository,
    private readonly usuarioRepository: UsuarioRepository,
    private readonly asignacionEventoRepository: AsignacionEventoRepository,
  ) {}

  public async execute(input: AgregarFotoInformeInput): Promise<FotoInforme> {
    const evento = await this.eventoRepository.findById(input.eventoId);
    if (!evento) {
      throw new NotFoundError(`No existe un evento con id "${input.eventoId}".`);
    }

    const permiso = await resolverPermisoInforme(
      { eventoRepository: this.eventoRepository, usuarioRepository: this.usuarioRepository, asignacionEventoRepository: this.asignacionEventoRepository },
      input.eventoId,
      input.usuarioId,
      input.rol,
    );

    let informe: Informe | null = await this.informeRepository.findByEventoId(input.eventoId);
    validarPuedeEditarInforme(informe, permiso);

    if (!informe) {
      informe = Informe.create({ id: randomUUID(), eventoId: input.eventoId, creadoPorId: input.usuarioId });
      await this.informeRepository.save(informe);
    }

    const foto = FotoInforme.create({ id: randomUUID(), informeId: informe.id, url: input.url });
    await this.fotoInformeRepository.save(foto);
    return foto;
  }
}
