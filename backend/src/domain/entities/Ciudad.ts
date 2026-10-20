import { validarNoVacio } from "../shared/validadores";

/**
 * Catálogo abierto de ciudades donde puede haber un punto/Sede de un evento.
 * Mismo criterio que Categoria: es una lista que crece con cada cliente
 * nuevo, así que es una entidad (una fila cargada), no un enum fijo en código.
 */
export interface CiudadProps {
  id: string;
  nombre: string;
  createdAt?: Date;
}

export class Ciudad {
  private readonly props: CiudadProps;

  private constructor(props: CiudadProps) {
    this.props = props;
  }

  public static create(props: CiudadProps): Ciudad {
    validarNoVacio(props.nombre, "Nombre de ciudad");
    if (props.createdAt === undefined) {
      props.createdAt = new Date();
    }
    return new Ciudad(props);
  }

  get id(): string { return this.props.id; }
  get nombre(): string { return this.props.nombre; }
  get createdAt(): Date { return this.props.createdAt!; }
}
