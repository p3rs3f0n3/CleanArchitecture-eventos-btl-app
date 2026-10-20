import { Ciudad } from "../../domain/entities/Ciudad";
import { CiudadRepository } from "../../domain/repositories/CiudadRepository";
import { normalizarParaComparar } from "../../domain/shared/normalizarTexto";
import { prisma } from "../database/prisma";
import type { Ciudad as CiudadPrisma } from "@prisma/client";

function toDomain(row: CiudadPrisma): Ciudad {
  return Ciudad.create({ id: row.id, nombre: row.nombre, createdAt: row.createdAt });
}

export class PrismaCiudadRepository implements CiudadRepository {
  async findById(id: string): Promise<Ciudad | null> {
    const row = await prisma.ciudad.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findByNombre(nombre: string): Promise<Ciudad | null> {
    // Comparación en memoria, no en la query: `mode: "insensitive"` de
    // Prisma/Postgres solo ignora mayúsculas, no tildes — "Cali" y "calí"
    // seguían pasando como distintas. El catálogo es chico, así que traer
    // todo y comparar normalizado es más simple que meter la extensión
    // "unaccent" de Postgres solo para esto.
    const buscado = normalizarParaComparar(nombre);
    const rows = await prisma.ciudad.findMany();
    const row = rows.find((r) => normalizarParaComparar(r.nombre) === buscado);
    return row ? toDomain(row) : null;
  }

  async findAll(): Promise<Ciudad[]> {
    const rows = await prisma.ciudad.findMany({ orderBy: { nombre: "asc" } });
    return rows.map(toDomain);
  }

  async save(ciudad: Ciudad): Promise<void> {
    await prisma.ciudad.create({
      data: { id: ciudad.id, nombre: ciudad.nombre, createdAt: ciudad.createdAt },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.ciudad.delete({ where: { id } });
  }
}
