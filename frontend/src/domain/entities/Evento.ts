export type EstadoEvento = 'PLANIFICADO' | 'INICIADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO' | 'DETENIDO';

export interface Evento {
  id: string;
  nombre: string;
  descripcion: string;
  imagenUrl?: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoEvento;
  clienteId: string;
  creadoPorId?: string;
  createdAt: string;
}
