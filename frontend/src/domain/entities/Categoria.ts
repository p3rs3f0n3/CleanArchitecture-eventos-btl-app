export interface Categoria {
  id: string;
  nombre: string;
  requiereMedidasFisicas: boolean;
  /** true SOLO para "Coordinador"/"Productor" — personal de gestión, elegible para recibir Usuario. */
  esGestion: boolean;
  createdAt: string;
}
