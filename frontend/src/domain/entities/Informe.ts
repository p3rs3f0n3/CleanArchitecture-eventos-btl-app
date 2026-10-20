export type EstadoInforme = 'BORRADOR' | 'ENVIADO' | 'AJUSTADO' | 'PUBLICADO';
export type TipoEntradaInforme = 'NOVEDAD' | 'OBSERVACION' | 'PREMIO';

export interface FotoInforme {
  id: string;
  informeId: string;
  url: string;
  createdAt: string;
}

/** Un aporte sumado al informe. Son inmutables: no se pisan, se suman. */
export interface EntradaInforme {
  id: string;
  informeId: string;
  tipo: TipoEntradaInforme;
  texto: string;
  autorId?: string;
  createdAt: string;
}

export interface Informe {
  id: string;
  eventoId: string;
  estado: EstadoInforme;
  creadoPorId?: string;
  ajustadoPorId?: string;
  createdAt: string;
  updatedAt: string;
  fotos: FotoInforme[];
  entradas: EntradaInforme[];
}
