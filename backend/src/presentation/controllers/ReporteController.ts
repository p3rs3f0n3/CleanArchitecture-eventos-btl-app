import { Request, Response } from "express";
import { useCases } from "../../infrastructure/di";
import { MomentoReporte } from "../../domain/entities/Reporte";

export async function crearReporte(req: Request, res: Response): Promise<void> {
  const { eventoId, momento, fotoUrl, observacion } = req.body;
  const reporte = await useCases.crearReporte.execute({
    eventoId,
    momento: momento as MomentoReporte,
    fotoUrl,
    observacion,
  });
  res.status(201).json({
    id: reporte.id,
    eventoId: reporte.eventoId,
    momento: reporte.momento,
    fotoUrl: reporte.fotoUrl,
    observacion: reporte.observacion,
    fecha: reporte.fecha,
  });
}
