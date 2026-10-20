import { validarNoVacio } from "../shared/validadores";

/**
 * Catálogo de especialidades del staff (Bartender, DJ, Modelo, Payaso,
 * Impulsador/a, etc.). Es una entidad —no un enum fijo en código— porque es
 * una lista ABIERTA que va a seguir creciendo con cada cliente nuevo: agregar
 * una categoría es cargar una fila, no tocar código (mismo criterio que ya
 * aplicamos para "tipo de participación" del staff en un evento).
 */
export interface CategoriaProps {
  id: string;
  nombre: string;
  /** Le dice al formulario de alta de Personal si debe pedir medidas/peso/estatura/talla. */
  requiereMedidasFisicas?: boolean;
  /** true SOLO para "Coordinador"/"Productor" — marca personal de gestión, elegible para tener Usuario. */
  esGestion?: boolean;
  createdAt?: Date;
}

export class Categoria {
  private readonly props: CategoriaProps;

  private constructor(props: CategoriaProps) {
    this.props = props;
  }

  public static create(props: CategoriaProps): Categoria {
    validarNoVacio(props.nombre, "Nombre de categoría");
    if (props.requiereMedidasFisicas === undefined) {
      props.requiereMedidasFisicas = false;
    }
    if (props.esGestion === undefined) {
      props.esGestion = false;
    }
    if (props.createdAt === undefined) {
      props.createdAt = new Date();
    }
    return new Categoria(props);
  }

  get id(): string { return this.props.id; }
  get nombre(): string { return this.props.nombre; }
  get requiereMedidasFisicas(): boolean { return this.props.requiereMedidasFisicas!; }
  get esGestion(): boolean { return this.props.esGestion!; }
  get createdAt(): Date { return this.props.createdAt!; }
}
