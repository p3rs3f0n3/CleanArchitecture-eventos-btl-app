import { randomUUID } from "node:crypto";
import { Evento, EstadoEvento } from "../../domain/entities/Evento";
import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { ClienteRepository } from "../../domain/repositories/ClienteRepository";
import { NotFoundError, ConflictError } from "../../domain/exceptions/DomainError";

export interface CrearEventoInput {
  nombre: string;
  descripcion: string;
  imagenUrl?: string;
  fechaInicio: Date;
  fechaFin: Date;
  clienteId: string;
  /** Usuario (COORDINADOR) autenticado que crea el evento — queda como dueño. */
  creadoPorId: string;
}

export class CrearEventoUseCase {
  constructor(
    private readonly eventoRepository: EventoRepository,
    private readonly clienteRepository: ClienteRepository,
  ) {}

  public async execute(input: CrearEventoInput): Promise<Evento> {
    const cliente = await this.clienteRepository.findById(input.clienteId);
    if (!cliente) {
      throw new NotFoundError(`No existe un cliente con id "${input.clienteId}".`);
    }
    if (!cliente.activo) {
      throw new ConflictError(`El cliente "${cliente.nombreEmpresa}" está inactivo. No se pueden crear eventos para un cliente inactivo.`);
    }

    const evento = Evento.create({
      id: randomUUID(),
      nombre: input.nombre,
      descripcion: input.descripcion,
      imagenUrl: input.imagenUrl ?? '',
      fechaInicio: input.fechaInicio,
      fechaFin: input.fechaFin,
      estado: EstadoEvento.PLANIFICADO,
      clienteId: input.clienteId,
      creadoPorId: input.creadoPorId,
    });

    await this.eventoRepository.save(evento);
    return evento;
  }
}
