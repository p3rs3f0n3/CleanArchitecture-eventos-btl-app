/**
 * Entidad de unión entre Evento y Personal. Guarda el "rol funcional" que
 * cumple esa persona EN ESE evento puntual (distinto del Rol de sistema de
 * Usuario, que define permisos de acceso — ver Usuario.ts).
 *
 * A propósito, esta entidad NO valida cruces de horario acá: esa es una
 * invariante que cruza MUCHOS eventos de MUCHO personal a la vez (necesita
 * consultar el repositorio completo), así que vive en el caso de uso
 * AsignarPersonalAEventoUseCase, no en esta entidad.
 */
import { randomUUID } from "node:crypto";

export enum TipoParticipacion {
  COORDINADOR = 'COORDINADOR',
  PRODUCTOR = 'PRODUCTOR',
  STAFF = 'STAFF',
}

export interface AsignacionEventoProps {
  id: string;
  eventoId: string;
  personalId: string;
  tipoParticipacion: TipoParticipacion;
  createdAt?: Date;
}

export class AsignacionEvento {
  private readonly props: AsignacionEventoProps;

  private constructor(props: AsignacionEventoProps) {
    this.props = props;
  }

  public static create(props: Omit<AsignacionEventoProps, 'id'> & { id?: string }): AsignacionEvento {
    const finalProps: AsignacionEventoProps = {
      ...props,
      id: props.id ?? randomUUID(),
      createdAt: props.createdAt ?? new Date(),
    };
    return new AsignacionEvento(finalProps);
  }

  get id(): string { return this.props.id; }
  get eventoId(): string { return this.props.eventoId; }
  get personalId(): string { return this.props.personalId; }
  get tipoParticipacion(): TipoParticipacion { return this.props.tipoParticipacion; }
  get createdAt(): Date { return this.props.createdAt!; }
}
