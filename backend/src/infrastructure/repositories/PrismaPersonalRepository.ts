import { Personal, Sexo } from "../../domain/entities/Personal";
import { PersonalRepository } from "../../domain/repositories/PersonalRepository";
import { prisma } from "../database/prisma";
import type { Personal as PersonalPrisma } from "@prisma/client";

function toDomain(row: PersonalPrisma): Personal {
  return Personal.create({
    id: row.id,
    nombreCompleto: row.nombreCompleto,
    documento: row.documento,
    telefono: row.telefono,
    sexo: row.sexo as Sexo,
    direccion: row.direccion,
    categoriaId: row.categoriaId,
    medidas: row.medidas ?? undefined,
    peso: row.peso ?? undefined,
    estatura: row.estatura ?? undefined,
    tallaRopa: row.tallaRopa ?? undefined,
    fotoUrl: row.fotoUrl ?? undefined,
    activo: row.activo,
    createdAt: row.createdAt,
  });
}

export class PrismaPersonalRepository implements PersonalRepository {
  async findById(id: string): Promise<Personal | null> {
    const row = await prisma.personal.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findAll(): Promise<Personal[]> {
    const rows = await prisma.personal.findMany();
    return rows.map(toDomain);
  }

  async save(personal: Personal): Promise<void> {
    await prisma.personal.create({
      data: {
        id: personal.id,
        nombreCompleto: personal.nombreCompleto,
        documento: personal.documento,
        telefono: personal.telefono,
        sexo: personal.sexo,
        direccion: personal.direccion,
        categoriaId: personal.categoriaId,
        medidas: personal.medidas ?? null,
        peso: personal.peso ?? null,
        estatura: personal.estatura ?? null,
        tallaRopa: personal.tallaRopa ?? null,
        fotoUrl: personal.fotoUrl ?? null,
        activo: personal.activo,
        createdAt: personal.createdAt,
      },
    });
  }

  async actualizar(personal: Personal): Promise<void> {
    await prisma.personal.update({
      where: { id: personal.id },
      data: {
        nombreCompleto: personal.nombreCompleto,
        telefono: personal.telefono,
        sexo: personal.sexo,
        direccion: personal.direccion,
        categoriaId: personal.categoriaId,
        medidas: personal.medidas ?? null,
        peso: personal.peso ?? null,
        estatura: personal.estatura ?? null,
        tallaRopa: personal.tallaRopa ?? null,
        fotoUrl: personal.fotoUrl ?? null,
        activo: personal.activo,
      },
    });
  }
}
