import { Reporte } from "../entities/Reporte";

export interface ReporteRepository {
  findByEventoId(eventoId: string): Promise<Reporte[]>;
  save(reporte: Reporte): Promise<void>;
}
