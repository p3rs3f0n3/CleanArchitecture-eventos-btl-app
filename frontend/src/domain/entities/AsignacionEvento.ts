export type TipoParticipacion = 'COORDINADOR' | 'PRODUCTOR' | 'STAFF';

export interface AsignacionEvento {
  id: string;
  eventoId: string;
  personalId: string;
  tipoParticipacion: TipoParticipacion;
}
