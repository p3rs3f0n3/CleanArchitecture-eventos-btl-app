import { Evento, EstadoEvento } from "../../domain/entities/Evento";
import { EventoRepository } from "../../domain/repositories/EventoRepository";
import { prisma } from "../database/prisma";
import type { Evento as EventoPrisma } from "@prisma/client";

/** Exportada (no privada) porque PrismaAsignacionEventoRepository también
 *  necesita convertir filas de Evento a la entidad de dominio. */
export function eventoRowToDomain(row: EventoPrisma): Evento {
  return Evento.create({
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    imagenUrl: row.imagenUrl ?? "",
    fechaInicio: row.fechaInicio,
    fechaFin: row.fechaFin,
    estado: row.estado as EstadoEvento,
    clienteId: row.clienteId,
    creadoPorId: row.creadoPorId ?? undefined,
    createdAt: row.createdAt,
  });
}

export class PrismaEventoRepository implements EventoRepository {
  async findById(id: string): Promise<Evento | null> {
    const row = await prisma.evento.findUnique({ where: { id } });
    return row ? eventoRowToDomain(row) : null;
  }

  async findByClienteId(clienteId: string): Promise<Evento[]> {
    const rows = await prisma.evento.findMany({ where: { clienteId } });
    return rows.map(eventoRowToDomain);
  }

  async findByIds(ids: string[]): Promise<Evento[]> {
    if (ids.length === 0) return [];
    const rows = await prisma.evento.findMany({ where: { id: { in: ids } } });
    return rows.map(eventoRowToDomain);
  }

  async save(evento: Evento): Promise<void> {
    await prisma.evento.create({
      data: {
        id: evento.id,
        nombre: evento.nombre,
        descripcion: evento.descripcion,
        imagenUrl: evento.imagenUrl || null,
        fechaInicio: evento.fechaInicio,
        fechaFin: evento.fechaFin,
        estado: evento.estado,
        clienteId: evento.clienteId,
        creadoPorId: evento.creadoPorId ?? null,
        createdAt: evento.createdAt,
      },
    });
  }

  async update(evento: Evento): Promise<void> {
    // Solo actualizamos el estado: es el único campo que cambia después de creado
    // en el alcance actual del MVP (no hay edición de nombre/fechas todavía).
    await prisma.evento.update({
      where: { id: evento.id },
      data: { estado: evento.estado },
    });
  }

  async actualizarImagen(eventoId: string, imagenUrl: string): Promise<void> {
    await prisma.evento.update({
      where: { id: eventoId },
      data: { imagenUrl },
    });
  }
}
