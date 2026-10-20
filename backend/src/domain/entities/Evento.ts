import { InvalidPropValueError } from "../exceptions/DomainError";
import { validarNoVacio } from "../shared/validadores";

export enum EstadoEvento {

  PLANIFICADO = 'PLANIFICADO',
  INICIADO = 'INICIADO',
  EN_CURSO = 'EN_CURSO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
  DETENIDO = 'DETENIDO',
  
}

export interface EventoProps {
  id: string;
  nombre: string;
  descripcion: string;
  imagenUrl: string;       
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoEvento;
  clienteId: string;
  /** Usuario (COORDINADOR) que creó el evento — determina qué eventos ve cada Coordinador. */
  creadoPorId?: string;
  createdAt?: Date;
}

export class Evento {

  private readonly props: EventoProps;

  private constructor(props: EventoProps) {
    this.props = props;
  }

  public get id(): string { return this.props.id; }
  public get nombre(): string { return this.props.nombre; }
  public get descripcion(): string { return this.props.descripcion; }
  public get imagenUrl(): string { return this.props.imagenUrl; }
  public get fechaInicio(): Date { return this.props.fechaInicio; }
  public get fechaFin(): Date { return this.props.fechaFin; }
  public get estado(): EstadoEvento { return this.props.estado; }
  public get clienteId(): string { return this.props.clienteId; }
  public get creadoPorId(): string | undefined { return this.props.creadoPorId; }
  public get createdAt(): Date { return this.props.createdAt!; }

  /**
   * Cambia el estado del evento. La entidad NO valida acá si hace falta
   * evidencia (foto/reporte) para el cambio — esa regla cruza con la
   * entidad Reporte, así que vive en el caso de uso
   * (CambiarEstadoEventoUseCase), no en el dominio puro de Evento.
   */
  public cambiarEstado(nuevoEstado: EstadoEvento): void {
    this.props.estado = nuevoEstado;
  }

  /** Se usa después de subir el archivo (ver SubirImagenEventoUseCase). */
  public actualizarImagen(imagenUrl: string): void {
    this.props.imagenUrl = imagenUrl;
  }

  public static create(props: EventoProps): Evento {

    validarNoVacio(props.nombre, "Nombre del evento");
    validarNoVacio(props.descripcion, "Descripción del evento");

    if (props.fechaFin < props.fechaInicio) {
      throw new InvalidPropValueError('Un evento no puede finalizar antes de iniciar');
    }

    if (props.createdAt === undefined) {
      props.createdAt = new Date();
    }
    
    return new Evento(props);

  }  

}