import { Reporte, MomentoReporte } from "../../domain/entities/Reporte";
import { ReporteRepository } from "../../domain/repositories/ReporteRepository";
import { prisma } from "../database/prisma";
import type { Reporte as ReportePrisma } from "@prisma/client";

function toDomain(row: ReportePrisma): Reporte {
  return Reporte.create({
    id: row.id,
    eventoId: row.eventoId,
    momento: row.momento as MomentoReporte,
    fotoUrl: row.fotoUrl ?? undefined,
    observacion: row.observacion ?? undefined,
    fecha: row.fecha,
  });
}

export class PrismaReporteRepository implements ReporteRepository {
  async findByEventoId(eventoId: string): Promise<Reporte[]> {
    const rows = await prisma.reporte.findMany({ where: { eventoId } });
    return rows.map(toDomain);
  }

  async save(reporte: Reporte): Promise<void> {
    await prisma.reporte.create({
      data: {
        id: reporte.id,
        eventoId: reporte.eventoId,
        momento: reporte.momento,
        fotoUrl: reporte.fotoUrl ?? null,
        observacion: reporte.observacion ?? null,
        fecha: reporte.fecha,
      },
    });
  }
}
