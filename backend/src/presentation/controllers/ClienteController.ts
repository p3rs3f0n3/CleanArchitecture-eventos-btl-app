import { Request, Response } from "express";
import { useCases } from "../../infrastructure/di";
import { Cliente } from "../../domain/entities/Cliente";
import { RolSistema } from "../../domain/entities/Usuario";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

function serializeCliente(cliente: Cliente) {
  return {
    id: cliente.id,
    nombreEmpresa: cliente.nombreEmpresa,
    contactoNombre: cliente.contactoNombre,
    contactoEmail: cliente.contactoEmail,
    contactoTelefono: cliente.contactoTelefono,
    direccion: cliente.direccion,
    activo: cliente.activo,
    createdAt: cliente.createdAt,
  };
}

export async function crearCliente(req: Request, res: Response): Promise<void> {
  const { nombreEmpresa, contactoNombre, contactoEmail, contactoTelefono, direccion } = req.body;
  const cliente = await useCases.crearCliente.execute({ nombreEmpresa, contactoNombre, contactoEmail, contactoTelefono, direccion });
  res.status(201).json(serializeCliente(cliente));
}

export async function listarClientes(_req: Request, res: Response): Promise<void> {
  const clientes = await useCases.listarClientes.execute();
  res.status(200).json(clientes.map(serializeCliente));
}

/** SOLO el propio CLIENTE — el id sale del token, nunca de un parámetro que el cliente pueda manipular. */
export async function obtenerClientePropio(req: AuthenticatedRequest, res: Response): Promise<void> {
  const cliente = await useCases.obtenerClientePropio.execute(req.usuario!.clienteId);
  res.status(200).json(serializeCliente(cliente));
}

/**
 * SOLO accesible por ADMIN/COORDINADOR (ver clienteRoutes.ts) — a diferencia
 * de /auth/register (público, para ADMIN/COORDINADOR autogestionados), acá
 * es el admin quien le da el primer acceso a un Cliente que ya existe como
 * entidad de negocio pero todavía no tiene credenciales para loguearse.
 */
export async function crearAccesoCliente(req: Request, res: Response): Promise<void> {
  const clienteId = req.params.clienteId as string;
  const { email, password } = req.body;
  const usuario = await useCases.register.execute({
    email,
    password,
    rol: RolSistema.CLIENTE,
    clienteId,
  });
  res.status(201).json({ id: usuario.id, email: usuario.email, rol: usuario.rol });
}

/** SOLO ADMIN (ver clienteRoutes.ts) */
export async function actualizarCliente(req: Request, res: Response): Promise<void> {
  const clienteId = req.params.clienteId as string;
  const { nombreEmpresa, contactoNombre, contactoEmail, contactoTelefono, direccion } = req.body;
  const cliente = await useCases.actualizarCliente.execute({
    clienteId,
    nombreEmpresa,
    contactoNombre,
    contactoEmail,
    contactoTelefono,
    direccion,
  });
  res.status(200).json(serializeCliente(cliente));
}

/** SOLO ADMIN (ver clienteRoutes.ts) */
export async function cambiarEstadoActivoCliente(req: Request, res: Response): Promise<void> {
  const clienteId = req.params.clienteId as string;
  const { activo } = req.body;
  const cliente = await useCases.cambiarEstadoActivoCliente.execute(clienteId, Boolean(activo));
  res.status(200).json(serializeCliente(cliente));
}
