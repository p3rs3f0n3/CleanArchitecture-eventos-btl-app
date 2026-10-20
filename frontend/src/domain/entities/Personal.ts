export type Sexo = 'MASCULINO' | 'FEMENINO' | 'OTRO';

export interface Personal {
  id: string;
  nombreCompleto: string;
  documento: string;
  telefono: string;
  sexo: Sexo;
  direccion: string;
  categoriaId: string;
  medidas?: string;
  peso?: number;
  estatura?: number;
  tallaRopa?: string;
  fotoUrl?: string;
  activo: boolean;
  createdAt: string;
}
