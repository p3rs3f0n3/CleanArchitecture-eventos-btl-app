import { Categoria } from "../../domain/entities/Categoria";
import { CategoriaRepository } from "../../domain/repositories/CategoriaRepository";
import { normalizarParaComparar } from "../../domain/shared/normalizarTexto";
import { prisma } from "../database/prisma";
import type { Categoria as CategoriaPrisma } from "@prisma/client";

function toDomain(row: CategoriaPrisma): Categoria {
  return Categoria.create({
    id: row.id,
    nombre: row.nombre,
    requiereMedidasFisicas: row.requiereMedidasFisicas,
    esGestion: row.esGestion,
    createdAt: row.createdAt,
  });
}

export class PrismaCategoriaRepository implements CategoriaRepository {
  async findById(id: string): Promise<Categoria | null> {
    const row = await prisma.categoria.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findByNombre(nombre: string): Promise<Categoria | null> {
    // Comparación en memoria: ver el mismo comentario en PrismaCiudadRepository
    // — "mode: insensitive" no cubre tildes, y acá pasa lo mismo con nombres
    // como "Impulsador/a" vs variantes con o sin acento.
    const buscado = normalizarParaComparar(nombre);
    const rows = await prisma.categoria.findMany();
    const row = rows.find((r) => normalizarParaComparar(r.nombre) === buscado);
    return row ? toDomain(row) : null;
  }

  async findAll(): Promise<Categoria[]> {
    const rows = await prisma.categoria.findMany({ orderBy: { nombre: "asc" } });
    return rows.map(toDomain);
  }

  async save(categoria: Categoria): Promise<void> {
    await prisma.categoria.create({
      data: {
        id: categoria.id,
        nombre: categoria.nombre,
        requiereMedidasFisicas: categoria.requiereMedidasFisicas,
        esGestion: categoria.esGestion,
        createdAt: categoria.createdAt,
      },
    });
  }
}
