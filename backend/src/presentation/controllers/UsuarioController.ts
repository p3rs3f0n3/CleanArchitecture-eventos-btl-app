import { Request, Response } from "express";
import { useCases } from "../../infrastructure/di";
import { Usuario } from "../../domain/entities/Usuario";

function serializeUsuario(usuario: Usuario) {
  return {
    id: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    clienteId: usuario.clienteId,
    personalId: usuario.personalId,
    activo: usuario.activo,
    createdAt: usuario.createdAt,
  };
}

/** Todo este controller es SOLO ADMIN (ver usuarioRoutes.ts) — panel de "Administración". */

export async function listarUsuarios(_req: Request, res: Response): Promise<void> {
  const usuarios = await useCases.listarUsuarios.execute();
  res.status(200).json(usuarios.map(serializeUsuario));
}

export async function cambiarEstadoActivoUsuario(req: Request, res: Response): Promise<void> {
  const usuarioId = req.params.usuarioId as string;
  const { activo } = req.body;
  await useCases.cambiarEstadoActivoUsuario.execute(usuarioId, Boolean(activo));
  res.status(200).json({ mensaje: activo ? "Cuenta desbloqueada." : "Cuenta bloqueada." });
}

export async function resetearPasswordUsuario(req: Request, res: Response): Promise<void> {
  const usuarioId = req.params.usuarioId as string;
  const { passwordNueva } = req.body;
  await useCases.resetearPassword.execute(usuarioId, passwordNueva);
  res.status(200).json({ mensaje: "Contraseña reseteada correctamente." });
}
