import { FotoInforme } from "../../domain/entities/FotoInforme";
import { FotoInformeRepository } from "../../domain/repositories/FotoInformeRepository";
import { prisma } from "../database/prisma";
import type { FotoInforme as FotoInformePrisma } from "@prisma/client";

function toDomain(row: FotoInformePrisma): FotoInforme {
  return FotoInforme.create({ id: row.id, informeId: row.informeId, url: row.url, createdAt: row.createdAt });
}

export class PrismaFotoInformeRepository implements FotoInformeRepository {
  async findByInformeId(informeId: string): Promise<FotoInforme[]> {
    const rows = await prisma.fotoInforme.findMany({ where: { informeId }, orderBy: { createdAt: "asc" } });
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<FotoInforme | null> {
    const row = await prisma.fotoInforme.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async save(foto: FotoInforme): Promise<void> {
    await prisma.fotoInforme.create({
      data: { id: foto.id, informeId: foto.informeId, url: foto.url, createdAt: foto.createdAt },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.fotoInforme.delete({ where: { id } });
  }
}
