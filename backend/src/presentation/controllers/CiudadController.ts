import { Request, Response } from "express";
import { useCases } from "../../infrastructure/di";
import { Ciudad } from "../../domain/entities/Ciudad";

function serializeCiudad(ciudad: Ciudad) {
  return { id: ciudad.id, nombre: ciudad.nombre, createdAt: ciudad.createdAt };
}

export async function crearCiudad(req: Request, res: Response): Promise<void> {
  const { nombre } = req.body;
  const ciudad = await useCases.crearCiudad.execute({ nombre });
  res.status(201).json(serializeCiudad(ciudad));
}

export async function listarCiudades(_req: Request, res: Response): Promise<void> {
  const ciudades = await useCases.listarCiudades.execute();
  res.status(200).json(ciudades.map(serializeCiudad));
}

export async function eliminarCiudad(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  await useCases.eliminarCiudad.execute(id);
  res.status(204).send();
}
