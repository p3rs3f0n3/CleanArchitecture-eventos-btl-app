import { Request, Response } from "express";
import { useCases } from "../../infrastructure/di";
import { Evento, EstadoEvento } from "../../domain/entities/Evento";
import { Sede } from "../../domain/entities/Sede";
import { AsignacionEvento } from "../../domain/entities/AsignacionEvento";
import { RolSistema } from "../../domain/entities/Usuario";
import { InvalidPropValueError } from "../../domain/exceptions/DomainError";
import { env } from "../../infrastructure/config/env";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

function serializeSede(sede: Sede) {
  return { id: sede.id, eventoId: sede.eventoId, nombre: sede.nombre, direccion: sede.direccion, ciudadId: sede.ciudadId, createdAt: sede.createdAt };
}

function serializeAsignacion(asignacion: AsignacionEvento) {
  return {
    id: asignacion.id,
    eventoId: asignacion.eventoId,
    personalId: asignacion.personalId,
    tipoParticipacion: asignacion.tipoParticipacion,
    createdAt: asignacion.createdAt,
  };
}

function serializeEvento(evento: Evento) {
  return {
    id: evento.id,
    nombre: evento.nombre,
    descripcion: evento.descripcion,
    imagenUrl: evento.imagenUrl,
    fechaInicio: evento.fechaInicio,
    fechaFin: evento.fechaFin,
    estado: evento.estado,
    clienteId: evento.clienteId,
    creadoPorId: evento.creadoPorId,
    createdAt: evento.createdAt,
  };
}

export async function crearEvento(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { nombre, descripcion, imagenUrl, fechaInicio, fechaFin, clienteId } = req.body;
  const evento = await useCases.crearEvento.execute({
    nombre,
    descripcion,
    imagenUrl,
    fechaInicio: new Date(fechaInicio),
    fechaFin: new Date(fechaFin),
    clienteId,
    creadoPorId: req.usuario!.usuarioId,
  });
  res.status(201).json(serializeEvento(evento));
}

export async function listarEventosPorCliente(req: AuthenticatedRequest, res: Response): Promise<void> {
  const clienteId = req.params.clienteId as string;
  const eventos = await useCases.listarEventosPorCliente.execute({
    clienteId,
    usuarioId: req.usuario!.usuarioId,
    rol: req.usuario!.rol as RolSistema,
  });
  res.status(200).json(eventos.map(serializeEvento));
}

/** "Mis eventos" del PRODUCTOR — SOLO PRODUCTOR (ver eventoRoutes.ts). */
export async function listarEventosAsignados(req: AuthenticatedRequest, res: Response): Promise<void> {
  const eventos = await useCases.listarEventosAsignados.execute(req.usuario!.usuarioId);
  res.status(200).json(eventos.map(serializeEvento));
}

export async function cambiarEstadoEvento(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { nuevoEstado, fotoUrl, observacion } = req.body;
  const evento = await useCases.cambiarEstadoEvento.execute({
    eventoId: id,
    nuevoEstado: nuevoEstado as EstadoEvento,
    fotoUrl,
    observacion,
  });
  res.status(200).json(serializeEvento(evento));
}

/** SOLO COORDINADOR (ver eventoRoutes.ts) */
export async function crearSede(req: Request, res: Response): Promise<void> {
  const eventoId = req.params.eventoId as string;
  const { nombre, direccion, ciudadId } = req.body;
  const sede = await useCases.crearSede.execute({ eventoId, nombre, direccion, ciudadId });
  res.status(201).json(serializeSede(sede));
}

export async function listarSedesPorEvento(req: Request, res: Response): Promise<void> {
  const eventoId = req.params.eventoId as string;
  const sedes = await useCases.listarSedesPorEvento.execute(eventoId);
  res.status(200).json(sedes.map(serializeSede));
}

export async function listarAsignacionesPorEvento(req: Request, res: Response): Promise<void> {
  const eventoId = req.params.eventoId as string;
  const asignaciones = await useCases.listarAsignacionesPorEvento.execute(eventoId);
  res.status(200).json(asignaciones.map(serializeAsignacion));
}

/** SOLO COORDINADOR (ver eventoRoutes.ts) — recibe el archivo ya guardado por uploadMiddleware. */
export async function subirImagenEvento(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!req.file) {
    throw new InvalidPropValueError("No se recibió ningún archivo de imagen.");
  }
  const imagenUrl = `${env.publicUrl}/uploads/eventos/${req.file.filename}`;
  const evento = await useCases.subirImagenEvento.execute(id, imagenUrl);
  res.status(200).json(serializeEvento(evento));
}
