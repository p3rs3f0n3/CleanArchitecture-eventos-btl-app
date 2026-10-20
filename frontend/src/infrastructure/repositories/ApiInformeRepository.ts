import { ApiClient } from "../http/ApiClient";
import { InformeRepository, AgregarEntradaInformeData } from "../../domain/repositories/InformeRepository";
import { Informe, FotoInforme } from "../../domain/entities/Informe";

export class ApiInformeRepository implements InformeRepository {
  obtenerPorEvento(eventoId: string): Promise<Informe | null> {
    return ApiClient.get<Informe | null>(`/informes/evento/${eventoId}`);
  }

  agregarEntrada(eventoId: string, data: AgregarEntradaInformeData): Promise<Informe> {
    return ApiClient.post<Informe>(`/informes/evento/${eventoId}/entradas`, data);
  }

  agregarFoto(eventoId: string, archivo: File): Promise<FotoInforme> {
    const formData = new FormData();
    formData.append('foto', archivo);
    return ApiClient.postFormData<FotoInforme>(`/informes/evento/${eventoId}/fotos`, formData);
  }

  eliminarFoto(fotoId: string): Promise<void> {
    return ApiClient.delete<void>(`/informes/fotos/${fotoId}`);
  }

  enviar(eventoId: string): Promise<Informe> {
    return ApiClient.post<Informe>(`/informes/evento/${eventoId}/enviar`);
  }

  marcarAjustado(eventoId: string): Promise<Informe> {
    return ApiClient.post<Informe>(`/informes/evento/${eventoId}/ajustar`);
  }

  publicar(eventoId: string): Promise<Informe> {
    return ApiClient.post<Informe>(`/informes/evento/${eventoId}/publicar`);
  }
}
