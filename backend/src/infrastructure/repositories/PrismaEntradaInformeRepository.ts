import { EntradaInforme, TipoEntradaInforme } from "../../domain/entities/EntradaInforme";
import { EntradaInformeRepository } from "../../domain/repositories/EntradaInformeRepository";
import { prisma } from "../database/prisma";
import type { EntradaInforme as EntradaInformePrisma } from "@prisma/client";

function toDomain(row: EntradaInformePrisma): EntradaInforme {
  return EntradaInforme.create({
    id: row.id,
    informeId: row.informeId,
    tipo: row.tipo as TipoEntradaInforme,
    texto: row.texto,
    autorId: row.autorId ?? undefined,
    createdAt: row.createdAt,
  });
}

export class PrismaEntradaInformeRepository implements EntradaInformeRepository {
  async findByInformeId(informeId: string): Promise<EntradaInforme[]> {
    const rows = await prisma.entradaInforme.findMany({
      where: { informeId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toDomain);
  }

  async save(entrada: EntradaInforme): Promise<void> {
    await prisma.entradaInforme.create({
      data: {
        id: entrada.id,
        informeId: entrada.informeId,
        tipo: entrada.tipo,
        texto: entrada.texto,
        autorId: entrada.autorId ?? null,
        createdAt: entrada.createdAt,
      },
    });
  }
}
