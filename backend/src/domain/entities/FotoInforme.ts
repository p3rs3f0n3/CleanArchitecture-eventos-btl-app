import { validarNoVacio } from "../shared/validadores";

export interface FotoInformeProps {
  id: string;
  informeId: string;
  url: string;
  createdAt?: Date;
}

export class FotoInforme {
  private readonly props: FotoInformeProps;

  private constructor(props: FotoInformeProps) {
    this.props = props;
  }

  public static create(props: FotoInformeProps): FotoInforme {
    validarNoVacio(props.url, "URL de la foto");
    if (props.createdAt === undefined) {
      props.createdAt = new Date();
    }
    return new FotoInforme(props);
  }

  get id(): string { return this.props.id; }
  get informeId(): string { return this.props.informeId; }
  get url(): string { return this.props.url; }
  get createdAt(): Date { return this.props.createdAt!; }
}
