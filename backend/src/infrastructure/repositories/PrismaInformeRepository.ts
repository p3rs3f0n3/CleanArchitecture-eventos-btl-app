import { Informe, EstadoInforme } from "../../domain/entities/Informe";
import { InformeRepository } from "../../domain/repositories/InformeRepository";
import { prisma } from "../database/prisma";
import type { Informe as InformePrisma } from "@prisma/client";

function toDomain(row: InformePrisma): Informe {
  return Informe.create({
    id: row.id,
    eventoId: row.eventoId,
    estado: row.estado as EstadoInforme,
    creadoPorId: row.creadoPorId ?? undefined,
    ajustadoPorId: row.ajustadoPorId ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class PrismaInformeRepository implements InformeRepository {
  async findByEventoId(eventoId: string): Promise<Informe | null> {
    const row = await prisma.informe.findUnique({ where: { eventoId } });
    return row ? toDomain(row) : null;
  }

  async findById(id: string): Promise<Informe | null> {
    const row = await prisma.informe.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async save(informe: Informe): Promise<void> {
    await prisma.informe.create({
      data: {
        id: informe.id,
        eventoId: informe.eventoId,
        estado: informe.estado,
        creadoPorId: informe.creadoPorId ?? null,
        ajustadoPorId: informe.ajustadoPorId ?? null,
        createdAt: informe.createdAt,
        updatedAt: informe.updatedAt,
      },
    });
  }

  async update(informe: Informe): Promise<void> {
    await prisma.informe.update({
      where: { id: informe.id },
      data: {
        estado: informe.estado,
        ajustadoPorId: informe.ajustadoPorId ?? null,
        updatedAt: informe.updatedAt,
      },
    });
  }
}
