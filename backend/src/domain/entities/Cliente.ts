import { validarEmail, validarNoVacio, validarSoloDigitos, validarSoloLetras } from "../shared/validadores";

export interface ClienteProps {
  id: string;
  nombreEmpresa: string;
  contactoNombre: string;
  contactoEmail: string;
  contactoTelefono: string;
  direccion: string;
  activo?: boolean;
  createdAt?: Date;
}

function validarCampos(datos: { nombreEmpresa: string; contactoNombre: string; contactoEmail: string; contactoTelefono: string; direccion: string }): void {
  validarNoVacio(datos.nombreEmpresa, "Empresa");
  validarSoloLetras(datos.contactoNombre, "Nombre de contacto");
  validarEmail(datos.contactoEmail, "Email de contacto");
  validarSoloDigitos(datos.contactoTelefono, "Teléfono");
  validarNoVacio(datos.direccion, "Dirección");
}

export class Cliente {
  private readonly props: ClienteProps;

  private constructor(props: ClienteProps) {
    this.props = props;
  }

  public static create(props: ClienteProps): Cliente {
    validarCampos(props);
    if (props.createdAt === undefined) {
      props.createdAt = new Date();
    }
    if (props.activo === undefined) {
      props.activo = true;
    }
    return new Cliente(props);
  }

  get id(): string { return this.props.id; }
  get nombreEmpresa(): string { return this.props.nombreEmpresa; }
  get contactoNombre(): string { return this.props.contactoNombre; }
  get contactoEmail(): string { return this.props.contactoEmail; }
  get contactoTelefono(): string { return this.props.contactoTelefono; }
  get direccion(): string { return this.props.direccion; }
  get activo(): boolean { return this.props.activo!; }
  get createdAt(): Date { return this.props.createdAt!; }

  /** SOLO puede invocarse desde un caso de uso restringido a ADMIN (ver ActualizarClienteUseCase). */
  public actualizarDatos(datos: { nombreEmpresa: string; contactoNombre: string; contactoEmail: string; contactoTelefono: string; direccion: string }): void {
    validarCampos(datos);
    this.props.nombreEmpresa = datos.nombreEmpresa;
    this.props.contactoNombre = datos.contactoNombre;
    this.props.contactoEmail = datos.contactoEmail;
    this.props.contactoTelefono = datos.contactoTelefono;
    this.props.direccion = datos.direccion;
  }

  /** SOLO puede invocarse desde un caso de uso restringido a ADMIN. */
  public cambiarEstadoActivo(activo: boolean): void {
    this.props.activo = activo;
  }
}
