import { randomUUID } from "node:crypto";
import { Informe } from "../../domain/entities/Informe";
import { EntradaInforme, TipoEntradaInforme } from "../../domain/entities/EntradaInforme";
import { InformeRepository } from "../../domain/repositories/InformeRepository";
import { FotoInformeRepository } from "../../domain/repositories/FotoInformeRepository";
import { EntradaInformeRepository } from "../../domain/repositories/EntradaInformeRepository";
import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { AsignacionEventoRepository } from "../../domain/repositories/AsignacionEventoRepository";
import { RolSistema } from "../../domain/entities/Usuario";
import { NotFoundError } from "../../domain/exceptions/DomainError";
import { resolverPermisoInforme, validarPuedeEditarInforme } from "./permisosInforme";
import { InformeCompleto } from "./ObtenerInformePorEventoUseCase";

export interface AgregarEntradaInformeInput {
  eventoId: string;
  usuarioId: string;
  rol: RolSistema;
  tipo: TipoEntradaInforme;
  texto: string;
}

/**
 * Suma una entrada al Informe — nunca pisa lo anterior. El primer aporte
 * lo crea el Productor asignado; después lo pueden sumar según el estado
 * (ver validarPuedeEditarInforme).
 */
export class AgregarEntradaInformeUseCase {
  constructor(
    private readonly informeRepository: InformeRepository,
    private readonly fotoInformeRepository: FotoInformeRepository,
    private readonly entradaInformeRepository: EntradaInformeRepository,
    private readonly eventoRepository: EventoRepository,
    private readonly usuarioRepository: UsuarioRepository,
    private readonly asignacionEventoRepository: AsignacionEventoRepository,
  ) {}

  public async execute(input: AgregarEntradaInformeInput): Promise<InformeCompleto> {
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

    const entrada = EntradaInforme.create({
      id: randomUUID(),
      informeId: informe.id,
      tipo: input.tipo,
      texto: input.texto,
      autorId: input.usuarioId,
    });
    await this.entradaInformeRepository.save(entrada);

    const fotos = await this.fotoInformeRepository.findByInformeId(informe.id);
    const entradas = await this.entradaInformeRepository.findByInformeId(informe.id);
    return { informe, fotos, entradas };
  }
}
