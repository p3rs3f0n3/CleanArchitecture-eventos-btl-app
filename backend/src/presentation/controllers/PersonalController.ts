import { Request, Response } from "express";
import { useCases } from "../../infrastructure/di";
import { Personal, Sexo } from "../../domain/entities/Personal";
import { TipoParticipacion } from "../../domain/entities/AsignacionEvento";
import { RolSistema } from "../../domain/entities/Usuario";
import { InvalidPropValueError } from "../../domain/exceptions/DomainError";
import { env } from "../../infrastructure/config/env";

function serializePersonal(personal: Personal) {
  return {
    id: personal.id,
    nombreCompleto: personal.nombreCompleto,
    documento: personal.documento,
    telefono: personal.telefono,
    sexo: personal.sexo,
    direccion: personal.direccion,
    categoriaId: personal.categoriaId,
    medidas: personal.medidas,
    peso: personal.peso,
    estatura: personal.estatura,
    tallaRopa: personal.tallaRopa,
    fotoUrl: personal.fotoUrl,
    activo: personal.activo,
    createdAt: personal.createdAt,
  };
}

export async function crearPersonal(req: Request, res: Response): Promise<void> {
  const { nombreCompleto, documento, telefono, sexo, direccion, categoriaId, medidas, peso, estatura, tallaRopa } = req.body;
  const personal = await useCases.crearPersonal.execute({
    nombreCompleto,
    documento,
    telefono,
    sexo: sexo as Sexo,
    direccion,
    categoriaId,
    medidas,
    peso: peso !== undefined ? Number(peso) : undefined,
    estatura: estatura !== undefined ? Number(estatura) : undefined,
    tallaRopa,
  });
  res.status(201).json(serializePersonal(personal));
}

export async function asignarPersonalAEvento(req: Request, res: Response): Promise<void> {
  const { eventoId, personalId, tipoParticipacion } = req.body;
  const asignacion = await useCases.asignarPersonalAEvento.execute({
    eventoId,
    personalId,
    tipoParticipacion: tipoParticipacion as TipoParticipacion,
  });
  res.status(201).json({
    id: asignacion.id,
    eventoId: asignacion.eventoId,
    personalId: asignacion.personalId,
    tipoParticipacion: asignacion.tipoParticipacion,
  });
}

/**
 * SOLO ADMIN (ver personalRoutes.ts) — mismo patrón que crearAccesoCliente:
 * el Admin le da el primer acceso a un Personal que ya existe como entidad
 * de negocio, eligiendo si va a loguear como COORDINADOR o PRODUCTOR.
 */
export async function crearAccesoPersonal(req: Request, res: Response): Promise<void> {
  const personalId = req.params.personalId as string;
  const { email, password, rol } = req.body;
  const usuario = await useCases.register.execute({
    email,
    password,
    rol: rol as RolSistema,
    personalId,
  });
  res.status(201).json({ id: usuario.id, email: usuario.email, rol: usuario.rol });
}

export async function listarPersonal(_req: Request, res: Response): Promise<void> {
  const todos = await useCases.listarPersonal.execute();
  res.status(200).json(todos.map(serializePersonal));
}

export async function listarPersonalDisponible(req: Request, res: Response): Promise<void> {
  const { fechaInicio, fechaFin } = req.query;
  const disponibles = await useCases.listarPersonalDisponible.execute({
    fechaInicio: new Date(fechaInicio as string),
    fechaFin: new Date(fechaFin as string),
  });
  res.status(200).json(disponibles.map(serializePersonal));
}

/** SOLO ADMIN (ver personalRoutes.ts) */
export async function actualizarPersonal(req: Request, res: Response): Promise<void> {
  const personalId = req.params.personalId as string;
  const { nombreCompleto, telefono, sexo, direccion, categoriaId, medidas, peso, estatura, tallaRopa } = req.body;
  const personal = await useCases.actualizarPersonal.execute({
    personalId,
    nombreCompleto,
    telefono,
    sexo: sexo as Sexo,
    direccion,
    categoriaId,
    medidas,
    peso: peso !== undefined && peso !== '' ? Number(peso) : undefined,
    estatura: estatura !== undefined && estatura !== '' ? Number(estatura) : undefined,
    tallaRopa,
  });
  res.status(200).json(serializePersonal(personal));
}

/** SOLO ADMIN (ver personalRoutes.ts) */
export async function cambiarEstadoActivoPersonal(req: Request, res: Response): Promise<void> {
  const personalId = req.params.personalId as string;
  const { activo } = req.body;
  const personal = await useCases.cambiarEstadoActivoPersonal.execute(personalId, Boolean(activo));
  res.status(200).json(serializePersonal(personal));
}

/** ADMIN/COORDINADOR (ver personalRoutes.ts) — recibe el archivo ya guardado por uploadMiddleware. */
export async function subirFotoPersonal(req: Request, res: Response): Promise<void> {
  const personalId = req.params.personalId as string;
  if (!req.file) {
    throw new InvalidPropValueError("No se recibió ningún archivo de imagen.");
  }
  const fotoUrl = `${env.publicUrl}/uploads/personal/${req.file.filename}`;
  const personal = await useCases.subirFotoPersonal.execute(personalId, fotoUrl);
  res.status(200).json(serializePersonal(personal));
}
