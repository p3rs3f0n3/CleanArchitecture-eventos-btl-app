import { validarNoVacio, validarNumeroPositivo, validarSoloDigitos, validarSoloLetras } from "../shared/validadores";

export enum Sexo {
  MASCULINO = "MASCULINO",
  FEMENINO = "FEMENINO",
  OTRO = "OTRO",
}

export interface PersonalProps {
  id: string;
  nombreCompleto: string;
  documento: string;
  telefono: string;
  sexo: Sexo;
  direccion: string;
  categoriaId: string;
  /** Opcionales: solo aplican a categorías que representen modelos/perfiles con requisitos físicos. */
  medidas?: string;
  peso?: number;
  estatura?: number;
  tallaRopa?: string;
  fotoUrl?: string;
  activo?: boolean;
  createdAt?: Date;
}

/** Comunes entre create() y actualizarDatos() — documento queda afuera porque no es editable. */
function validarCamposEditables(datos: { nombreCompleto: string; telefono: string; direccion: string; peso?: number; estatura?: number }): void {
  validarSoloLetras(datos.nombreCompleto, "Nombre completo");
  validarSoloDigitos(datos.telefono, "Teléfono");
  validarNoVacio(datos.direccion, "Dirección");
  if (datos.peso !== undefined) {
    validarNumeroPositivo(datos.peso, "Peso", 20, 300);
  }
  if (datos.estatura !== undefined) {
    validarNumeroPositivo(datos.estatura, "Estatura", 50, 250);
  }
}

export class Personal {
  private readonly props: PersonalProps;

  private constructor(props: PersonalProps) {
    this.props = props;
  }

  public static create(props: PersonalProps): Personal {
    validarCamposEditables(props);
    validarSoloDigitos(props.documento, "Documento", 5, 15);
    if (props.createdAt === undefined) {
      props.createdAt = new Date();
    }
    if (props.activo === undefined) {
      props.activo = true;
    }
    return new Personal(props);
  }

  get id(): string { return this.props.id; }
  get nombreCompleto(): string { return this.props.nombreCompleto; }
  get documento(): string { return this.props.documento; }
  get telefono(): string { return this.props.telefono; }
  get sexo(): Sexo { return this.props.sexo; }
  get direccion(): string { return this.props.direccion; }
  get categoriaId(): string { return this.props.categoriaId; }
  get medidas(): string | undefined { return this.props.medidas; }
  get peso(): number | undefined { return this.props.peso; }
  get estatura(): number | undefined { return this.props.estatura; }
  get tallaRopa(): string | undefined { return this.props.tallaRopa; }
  get fotoUrl(): string | undefined { return this.props.fotoUrl; }
  get activo(): boolean { return this.props.activo!; }
  get createdAt(): Date { return this.props.createdAt!; }

  /** SOLO ADMIN (ver ActualizarPersonalUseCase). */
  public actualizarDatos(datos: {
    nombreCompleto: string;
    telefono: string;
    sexo: Sexo;
    direccion: string;
    categoriaId: string;
    medidas?: string;
    peso?: number;
    estatura?: number;
    tallaRopa?: string;
  }): void {
    validarCamposEditables(datos);
    this.props.nombreCompleto = datos.nombreCompleto;
    this.props.telefono = datos.telefono;
    this.props.sexo = datos.sexo;
    this.props.direccion = datos.direccion;
    this.props.categoriaId = datos.categoriaId;
    this.props.medidas = datos.medidas;
    this.props.peso = datos.peso;
    this.props.estatura = datos.estatura;
    this.props.tallaRopa = datos.tallaRopa;
  }

  /** SOLO ADMIN. */
  public cambiarEstadoActivo(activo: boolean): void {
    this.props.activo = activo;
  }

  /** Se usa después de subir el archivo (ver SubirFotoPersonalUseCase). */
  public actualizarFoto(fotoUrl: string): void {
    this.props.fotoUrl = fotoUrl;
  }
}
