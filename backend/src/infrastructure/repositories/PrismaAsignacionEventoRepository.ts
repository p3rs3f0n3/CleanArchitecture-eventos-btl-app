import { AsignacionEvento, TipoParticipacion } from "../../domain/entities/AsignacionEvento";
import { Evento } from "../../domain/entities/Evento";
import { AsignacionEventoRepository } from "../../domain/repositories/AsignacionEventoRepository";
import { prisma } from "../database/prisma";
import { eventoRowToDomain } from "./PrismaEventoRepository";
import type { AsignacionEvento as AsignacionEventoPrisma } from "@prisma/client";

function toDomain(row: AsignacionEventoPrisma): AsignacionEvento {
  return AsignacionEvento.create({
    id: row.id,
    eventoId: row.eventoId,
    personalId: row.personalId,
    tipoParticipacion: row.tipoParticipacion as TipoParticipacion,
    createdAt: row.createdAt,
  });
}

export class PrismaAsignacionEventoRepository implements AsignacionEventoRepository {
  async save(asignacion: AsignacionEvento): Promise<void> {
    await prisma.asignacionEvento.create({
      data: {
        id: asignacion.id,
        eventoId: asignacion.eventoId,
        personalId: asignacion.personalId,
        tipoParticipacion: asignacion.tipoParticipacion,
        createdAt: asignacion.createdAt,
      },
    });
  }

  async findByEventoId(eventoId: string): Promise<AsignacionEvento[]> {
    const rows = await prisma.asignacionEvento.findMany({ where: { eventoId } });
    return rows.map(toDomain);
  }

  async findByPersonalId(personalId: string): Promise<AsignacionEvento[]> {
    const rows = await prisma.asignacionEvento.findMany({ where: { personalId } });
    return rows.map(toDomain);
  }

  async findEventosAsignadosByPersonalId(personalId: string): Promise<Evento[]> {
    const rows = await prisma.asignacionEvento.findMany({
      where: { personalId },
      include: { evento: true },
    });
    return rows.map((row) => eventoRowToDomain(row.evento));
  }
}
