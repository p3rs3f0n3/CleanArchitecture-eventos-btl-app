import { ConflictError } from "../exceptions/DomainError";

/**
 * Flujo del Informe, de punta a punta:
 *  BORRADOR  → lo arma el Productor (puede sumar entradas y fotos).
 *  ENVIADO   → el Productor lo cierra y se lo manda al Coordinador. A partir
 *              de acá el Productor ya NO puede tocarlo.
 *  AJUSTADO  → el Coordinador lo revisó y confirmó. Solo él puede seguir sumando.
 *  PUBLICADO → recién ahí lo ve el Cliente. Nadie lo edita.
 *
 * Distinto de Reporte (la "evidencia" obligatoria de cada cambio de estado
 * del evento): acá es UN solo documento por evento que pasa por estos estados.
 */
export enum EstadoInforme {
  BORRADOR = 'BORRADOR',
  ENVIADO = 'ENVIADO',
  AJUSTADO = 'AJUSTADO',
  PUBLICADO = 'PUBLICADO',
}

export interface InformeProps {
  id: string;
  eventoId: string;
  estado?: EstadoInforme;
  creadoPorId?: string;
  ajustadoPorId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Informe {
  private props: InformeProps;

  private constructor(props: InformeProps) {
    this.props = props;
  }

  public static create(props: InformeProps): Informe {
    if (props.estado === undefined) {
      props.estado = EstadoInforme.BORRADOR;
    }
    if (props.createdAt === undefined) {
      props.createdAt = new Date();
    }
    if (props.updatedAt === undefined) {
      props.updatedAt = props.createdAt;
    }
    return new Informe(props);
  }

  get id(): string { return this.props.id; }
  get eventoId(): string { return this.props.eventoId; }
  get estado(): EstadoInforme { return this.props.estado!; }
  get creadoPorId(): string | undefined { return this.props.creadoPorId; }
  get ajustadoPorId(): string | undefined { return this.props.ajustadoPorId; }
  get createdAt(): Date { return this.props.createdAt!; }
  get updatedAt(): Date { return this.props.updatedAt!; }

  /** Invariante que no depende de quién pregunta: un informe publicado no admite cambios. */
  public assertEditable(): void {
    if (this.props.estado === EstadoInforme.PUBLICADO) {
      throw new ConflictError('No se puede editar un informe ya publicado.');
    }
  }

  /** Productor → Coordinador: el Productor cierra su parte. */
  public enviar(): void {
    if (this.props.estado !== EstadoInforme.BORRADOR) {
      throw new ConflictError('Solo se puede enviar al Coordinador un informe que esté en BORRADOR.');
    }
    this.props.estado = EstadoInforme.ENVIADO;
    this.props.updatedAt = new Date();
  }

  /** Coordinador: revisó lo que le llegó del Productor. */
  public marcarAjustado(usuarioId: string): void {
    if (this.props.estado !== EstadoInforme.ENVIADO) {
      throw new ConflictError('Solo se puede marcar como ajustado un informe que el Productor ya envió.');
    }
    this.props.estado = EstadoInforme.AJUSTADO;
    this.props.ajustadoPorId = usuarioId;
    this.props.updatedAt = new Date();
  }

  public publicar(): void {
    if (this.props.estado !== EstadoInforme.AJUSTADO) {
      throw new ConflictError('Solo se puede publicar un informe que ya fue ajustado.');
    }
    this.props.estado = EstadoInforme.PUBLICADO;
    this.props.updatedAt = new Date();
  }
}
