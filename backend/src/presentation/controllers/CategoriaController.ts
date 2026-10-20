import { Request, Response } from "express";
import { useCases } from "../../infrastructure/di";
import { Categoria } from "../../domain/entities/Categoria";

function serializeCategoria(categoria: Categoria) {
  return {
    id: categoria.id,
    nombre: categoria.nombre,
    requiereMedidasFisicas: categoria.requiereMedidasFisicas,
    esGestion: categoria.esGestion,
    createdAt: categoria.createdAt,
  };
}

export async function crearCategoria(req: Request, res: Response): Promise<void> {
  const { nombre, requiereMedidasFisicas } = req.body;
  const categoria = await useCases.crearCategoria.execute({ nombre, requiereMedidasFisicas: Boolean(requiereMedidasFisicas) });
  res.status(201).json(serializeCategoria(categoria));
}

export async function listarCategorias(_req: Request, res: Response): Promise<void> {
  const categorias = await useCases.listarCategorias.execute();
  res.status(200).json(categorias.map(serializeCategoria));
}
