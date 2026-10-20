import { randomUUID } from "node:crypto";
import { Sede } from "../../domain/entities/Sede";
import { SedeRepository } from "../../domain/repositories/SedeRepository";
import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { CiudadRepository } from "../../domain/repositories/CiudadRepository";
import { ClienteRepository } from "../../domain/repositories/ClienteRepository";
import { NotFoundError, ConflictError } from "../../domain/exceptions/DomainError";

export interface CrearSedeInput {
  eventoId: string;
  nombre: string;
  direccion: string;
  ciudadId: string;
}

/** SOLO COORDINADOR (ver eventoRoutes.ts) — agregar un punto/sede a un evento existente. */
export class CrearSedeUseCase {
  constructor(
    private readonly sedeRepository: SedeRepository,
    private readonly eventoRepository: EventoRepository,
    private readonly ciudadRepository: CiudadRepository,
    private readonly clienteRepository: ClienteRepository,
  ) {}

  public async execute(input: CrearSedeInput): Promise<Sede> {
    const evento = await this.eventoRepository.findById(input.eventoId);
    if (!evento) {
      throw new NotFoundError(`No existe un evento con id "${input.eventoId}".`);
    }
    const cliente = await this.clienteRepository.findById(evento.clienteId);
    if (!cliente?.activo) {
      throw new ConflictError(`El cliente dueño de este evento está inactivo. No se pueden hacer cambios en sus eventos.`);
    }
    const ciudad = await this.ciudadRepository.findById(input.ciudadId);
    if (!ciudad) {
      throw new NotFoundError(`No existe una ciudad con id "${input.ciudadId}".`);
    }
    const sede = Sede.create({ id: randomUUID(), ...input });
    await this.sedeRepository.crear(sede);
    return sede;
  }
}
