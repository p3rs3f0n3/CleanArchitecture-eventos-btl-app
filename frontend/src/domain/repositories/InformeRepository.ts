import { Informe, FotoInforme, TipoEntradaInforme } from "../entities/Informe";

export interface AgregarEntradaInformeData {
  tipo: TipoEntradaInforme;
  texto: string;
}

export interface InformeRepository {
  /** null si todavía no existe, o si quien pregunta no puede verlo (ej: Cliente antes de PUBLICADO). */
  obtenerPorEvento(eventoId: string): Promise<Informe | null>;
  /** Suma una entrada; nunca pisa las anteriores. */
  agregarEntrada(eventoId: string, data: AgregarEntradaInformeData): Promise<Informe>;
  agregarFoto(eventoId: string, archivo: File): Promise<FotoInforme>;
  eliminarFoto(fotoId: string): Promise<void>;
  /** SOLO PRODUCTOR asignado: BORRADOR → ENVIADO */
  enviar(eventoId: string): Promise<Informe>;
  /** SOLO COORDINADOR: ENVIADO → AJUSTADO */
  marcarAjustado(eventoId: string): Promise<Informe>;
  /** SOLO COORDINADOR: AJUSTADO → PUBLICADO */
  publicar(eventoId: string): Promise<Informe>;
}
