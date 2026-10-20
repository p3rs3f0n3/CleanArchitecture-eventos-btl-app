import { Response } from "express";
import { useCases } from "../../infrastructure/di";
import { Informe } from "../../domain/entities/Informe";
import { FotoInforme } from "../../domain/entities/FotoInforme";
import { EntradaInforme, TipoEntradaInforme } from "../../domain/entities/EntradaInforme";
import { InformeCompleto } from "../../application/informe/ObtenerInformePorEventoUseCase";
import { RolSistema } from "../../domain/entities/Usuario";
import { InvalidPropValueError } from "../../domain/exceptions/DomainError";
import { env } from "../../infrastructure/config/env";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

function serializeInforme(informe: Informe) {
  return {
    id: informe.id,
    eventoId: informe.eventoId,
    estado: informe.estado,
    creadoPorId: informe.creadoPorId,
    ajustadoPorId: informe.ajustadoPorId,
    createdAt: informe.createdAt,
    updatedAt: informe.updatedAt,
  };
}

function serializeFoto(foto: FotoInforme) {
  return { id: foto.id, informeId: foto.informeId, url: foto.url, createdAt: foto.createdAt };
}

function serializeEntrada(entrada: EntradaInforme) {
  return {
    id: entrada.id,
    informeId: entrada.informeId,
    tipo: entrada.tipo,
    texto: entrada.texto,
    autorId: entrada.autorId,
    createdAt: entrada.createdAt,
  };
}

/** Forma única para todas las acciones sobre el Informe: el front nunca distingue por endpoint. */
function serializeCompleto(resultado: InformeCompleto) {
  return {
    ...serializeInforme(resultado.informe),
    fotos: resultado.fotos.map(serializeFoto),
    entradas: resultado.entradas.map(serializeEntrada),
  };
}

const TIPOS_ENTRADA = Object.values(TipoEntradaInforme);

export async function obtenerInforme(req: AuthenticatedRequest, res: Response): Promise<void> {
  const eventoId = req.params.eventoId as string;
  const resultado = await useCases.obtenerInformePorEvento.execute(
    eventoId,
    req.usuario!.usuarioId,
    req.usuario!.rol as RolSistema,
  );
  if (!resultado) {
    res.status(200).json(null);
    return;
  }
  res.status(200).json(serializeCompleto(resultado));
}

export async function agregarEntrada(req: AuthenticatedRequest, res: Response): Promise<void> {
  const eventoId = req.params.eventoId as string;
  const { tipo, texto } = req.body;
  if (!TIPOS_ENTRADA.includes(tipo)) {
    throw new InvalidPropValueError(`El tipo de entrada debe ser uno de: ${TIPOS_ENTRADA.join(", ")}.`);
  }
  const resultado = await useCases.agregarEntradaInforme.execute({
    eventoId,
    usuarioId: req.usuario!.usuarioId,
    rol: req.usuario!.rol as RolSistema,
    tipo,
    texto: typeof texto === "string" ? texto : "",
  });
  res.status(201).json(serializeCompleto(resultado));
}

export async function agregarFoto(req: AuthenticatedRequest, res: Response): Promise<void> {
  const eventoId = req.params.eventoId as string;
  if (!req.file) {
    throw new InvalidPropValueError("No se recibió ningún archivo de imagen.");
  }
  const url = `${env.publicUrl}/uploads/informes/${req.file.filename}`;
  const foto = await useCases.agregarFotoInforme.execute({
    eventoId,
    usuarioId: req.usuario!.usuarioId,
    rol: req.usuario!.rol as RolSistema,
    url,
  });
  res.status(201).json(serializeFoto(foto));
}

export async function eliminarFoto(req: AuthenticatedRequest, res: Response): Promise<void> {
  const fotoId = req.params.fotoId as string;
  await useCases.eliminarFotoInforme.execute({
    fotoId,
    usuarioId: req.usuario!.usuarioId,
    rol: req.usuario!.rol as RolSistema,
  });
  res.status(204).send();
}

export async function enviar(req: AuthenticatedRequest, res: Response): Promise<void> {
  const eventoId = req.params.eventoId as string;
  const resultado = await useCases.enviarInforme.execute(eventoId, req.usuario!.usuarioId, req.usuario!.rol as RolSistema);
  res.status(200).json(serializeCompleto(resultado));
}

export async function marcarAjustado(req: AuthenticatedRequest, res: Response): Promise<void> {
  const eventoId = req.params.eventoId as string;
  const resultado = await useCases.marcarInformeAjustado.execute(eventoId, req.usuario!.usuarioId, req.usuario!.rol as RolSistema);
  res.status(200).json(serializeCompleto(resultado));
}

export async function publicar(req: AuthenticatedRequest, res: Response): Promise<void> {
  const eventoId = req.params.eventoId as string;
  const resultado = await useCases.publicarInforme.execute(eventoId, req.usuario!.usuarioId, req.usuario!.rol as RolSistema);
  res.status(200).json(serializeCompleto(resultado));
}
