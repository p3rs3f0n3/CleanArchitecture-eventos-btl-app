import { InvalidPropValueError } from "../exceptions/DomainError";
import { validarEmail } from "../shared/validadores";

/**
 * Rol DE SISTEMA — controla qué puede HACER este usuario en la aplicación
 * (permisos, endpoints). NO confundir con TipoParticipacion (AsignacionEvento.ts),
 * que es el rol funcional que cumple una persona DENTRO de un evento puntual.
 */
export enum RolSistema {
  ADMIN = 'ADMIN',
  CLIENTE = 'CLIENTE',
  COORDINADOR = 'COORDINADOR',
  PRODUCTOR = 'PRODUCTOR',
}

export interface UsuarioProps {
  id: string;
  email: string;
  passwordHash: string;
  rol: RolSistema;
  /** Obligatorio solo si rol === CLIENTE */
  clienteId?: string;
  /** Obligatorio solo si rol === COORDINADOR o PRODUCTOR */
  personalId?: string;
  /** Si es false, el login se rechaza ("cuenta bloqueada"). Solo ADMIN puede tocarlo. */
  activo?: boolean;
  createdAt?: Date;
}

export class Usuario {
  private readonly props: UsuarioProps;

  private constructor(props: UsuarioProps) {
    this.props = props;
  }

  public static create(props: UsuarioProps): Usuario {
    validarEmail(props.email, "Correo");
    if (props.passwordHash.length < 8) {
      throw new InvalidPropValueError('El hash de la contraseña es inválido (¿se olvidó de hashearla antes de crear el Usuario?).');
    }
    if (props.rol === RolSistema.CLIENTE && !props.clienteId) {
      throw new InvalidPropValueError('Un usuario con rol CLIENTE debe estar asociado a un Cliente (clienteId).');
    }
    if ((props.rol === RolSistema.COORDINADOR || props.rol === RolSistema.PRODUCTOR) && !props.personalId) {
      throw new InvalidPropValueError('Un usuario con rol COORDINADOR o PRODUCTOR debe estar asociado a un registro de Personal (personalId).');
    }
    if (props.createdAt === undefined) {
      props.createdAt = new Date();
    }
    if (props.activo === undefined) {
      props.activo = true;
    }
    return new Usuario(props);
  }

  get id(): string { return this.props.id; }
  get email(): string { return this.props.email; }
  get passwordHash(): string { return this.props.passwordHash; }
  get rol(): RolSistema { return this.props.rol; }
  get clienteId(): string | undefined { return this.props.clienteId; }
  get personalId(): string | undefined { return this.props.personalId; }
  get activo(): boolean { return this.props.activo!; }
  get createdAt(): Date { return this.props.createdAt!; }

  /** SOLO puede invocarse desde un caso de uso restringido a ADMIN — bloquear/desbloquear una cuenta. */
  public cambiarEstadoActivo(activo: boolean): void {
    this.props.activo = activo;
  }

  /** SOLO puede invocarse desde un caso de uso restringido a ADMIN — resetear sin pedir la contraseña anterior. */
  public reemplazarPasswordHash(nuevoHash: string): void {
    this.props.passwordHash = nuevoHash;
  }
}
