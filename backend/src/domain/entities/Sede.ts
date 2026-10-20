import { validarNoVacio } from "../shared/validadores";

/**
 * Un "punto" físico donde ocurre (una parte de) el evento. Relación 1 Evento
 * -> muchas Sedes: un evento puede activarse en un solo lugar o en varios,
 * en la misma ciudad o en distintas (regla original de Nelly al diseñar el
 * dominio). Las carga el Coordinador, dueño operativo del evento.
 */
export interface SedeProps {
  id: string;
  eventoId: string;
  nombre: string;
  direccion: string;
  ciudadId: string;
  createdAt?: Date;
}

export class Sede {
  private readonly props: SedeProps;

  private constructor(props: SedeProps) {
    this.props = props;
  }

  public static create(props: SedeProps): Sede {
    validarNoVacio(props.nombre, "Nombre del punto");
    validarNoVacio(props.direccion, "Dirección del punto");
    validarNoVacio(props.ciudadId, "Ciudad");
    if (props.createdAt === undefined) {
      props.createdAt = new Date();
    }
    return new Sede(props);
  }

  get id(): string { return this.props.id; }
  get eventoId(): string { return this.props.eventoId; }
  get nombre(): string { return this.props.nombre; }
  get direccion(): string { return this.props.direccion; }
  get ciudadId(): string { return this.props.ciudadId; }
  get createdAt(): Date { return this.props.createdAt!; }
}
