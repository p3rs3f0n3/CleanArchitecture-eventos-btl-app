import { Sede } from "../../domain/entities/Sede";
import { SedeRepository } from "../../domain/repositories/SedeRepository";
import { prisma } from "../database/prisma";
import type { Sede as SedePrisma } from "@prisma/client";

function toDomain(row: SedePrisma): Sede {
  return Sede.create({
    id: row.id,
    eventoId: row.eventoId,
    nombre: row.nombre,
    direccion: row.direccion,
    ciudadId: row.ciudadId,
    createdAt: row.createdAt,
  });
}

export class PrismaSedeRepository implements SedeRepository {
  async crear(sede: Sede): Promise<void> {
    await prisma.sede.create({
      data: {
        id: sede.id,
        eventoId: sede.eventoId,
        nombre: sede.nombre,
        direccion: sede.direccion,
        ciudadId: sede.ciudadId,
        createdAt: sede.createdAt,
      },
    });
  }

  async findByEventoId(eventoId: string): Promise<Sede[]> {
    const rows = await prisma.sede.findMany({ where: { eventoId }, orderBy: { createdAt: "asc" } });
    return rows.map(toDomain);
  }

  async findByCiudadId(ciudadId: string): Promise<Sede[]> {
    const rows = await prisma.sede.findMany({ where: { ciudadId } });
    return rows.map(toDomain);
  }
}
