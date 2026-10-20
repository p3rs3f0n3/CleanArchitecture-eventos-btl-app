import { InvalidPropValueError } from "../exceptions/DomainError";

export enum MomentoReporte {
  INICIO = 'INICIO',
  DURANTE = 'DURANTE',
  FINALIZACION = 'FINALIZACION',
}

export interface ReporteProps {
  id: string;
  eventoId: string;
  momento: MomentoReporte;
  fotoUrl?: string;
  observacion?: string;
  fecha?: Date;
}

export class Reporte {
  private readonly props: ReporteProps;

  private constructor(props: ReporteProps) {
    this.props = props;
  }

  /**
   * Invariante clave del negocio (la que vos misma definiste): un reporte
   * necesita SÍ O SÍ una foto y/o una observación — no puede quedar vacío,
   * porque es la evidencia que habilita el cambio de estado del evento.
   */
  public static create(props: ReporteProps): Reporte {
    const sinFoto = !props.fotoUrl || props.fotoUrl.trim().length === 0;
    const sinObservacion = !props.observacion || props.observacion.trim().length === 0;
    if (sinFoto && sinObservacion) {
      throw new InvalidPropValueError('Un reporte debe incluir al menos una foto o una observación.');
    }
    if (props.fecha === undefined) {
      props.fecha = new Date();
    }
    return new Reporte(props);
  }

  get id(): string { return this.props.id; }
  get eventoId(): string { return this.props.eventoId; }
  get momento(): MomentoReporte { return this.props.momento; }
  get fotoUrl(): string | undefined { return this.props.fotoUrl; }
  get observacion(): string | undefined { return this.props.observacion; }
  get fecha(): Date { return this.props.fecha!; }
}
