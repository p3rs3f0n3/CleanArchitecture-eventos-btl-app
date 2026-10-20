import { InvalidPropValueError } from "../exceptions/DomainError";

export enum TipoEntradaInforme {
  NOVEDAD = 'NOVEDAD',
  OBSERVACION = 'OBSERVACION',
  PREMIO = 'PREMIO',
}

export interface EntradaInformeProps {
  id: string;
  informeId: string;
  tipo: TipoEntradaInforme;
  texto: string;
  autorId?: string;
  createdAt?: Date;
}

/**
 * Una entrada = un aporte que alguien suma al Informe. Es inmutable a propósito:
 * no hay "editar" ni "pisar" — si el Productor se equivocó, suma otra entrada.
 * Así queda registrado quién escribió qué y cuándo.
 */
export class EntradaInforme {
  private constructor(private readonly props: EntradaInformeProps) {}

  public static create(props: EntradaInformeProps): EntradaInforme {
    const texto = props.texto.trim();
    if (texto.length === 0) {
      throw new InvalidPropValueError('La entrada del informe no puede estar vacía.');
    }
    return new EntradaInforme({
      ...props,
      texto,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  get id(): string { return this.props.id; }
  get informeId(): string { return this.props.informeId; }
  get tipo(): TipoEntradaInforme { return this.props.tipo; }
  get texto(): string { return this.props.texto; }
  get autorId(): string | undefined { return this.props.autorId; }
  get createdAt(): Date { return this.props.createdAt!; }
}
