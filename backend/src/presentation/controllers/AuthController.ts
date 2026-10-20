import { Request, Response } from "express";
import { useCases } from "../../infrastructure/di";
import { RolSistema } from "../../domain/entities/Usuario";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, rol, clienteId, personalId } = req.body;
  const usuario = await useCases.register.execute({
    email,
    password,
    rol: rol as RolSistema,
    clienteId,
    personalId,
  });
  res.status(201).json({ id: usuario.id, email: usuario.email, rol: usuario.rol });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const { token, usuario } = await useCases.login.execute({ email, password });
  res.status(200).json({
    token,
    usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol },
  });
}

export async function cambiarPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { passwordActual, passwordNueva } = req.body;
  await useCases.cambiarPassword.execute({
    usuarioId: req.usuario!.usuarioId,
    passwordActual,
    passwordNueva,
  });
  res.status(200).json({ mensaje: "Contraseña actualizada correctamente." });
}
