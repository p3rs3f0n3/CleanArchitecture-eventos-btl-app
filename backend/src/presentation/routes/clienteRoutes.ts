import { Router } from "express";
import {
  crearCliente,
  listarClientes,
  crearAccesoCliente,
  actualizarCliente,
  cambiarEstadoActivoCliente,
} from "../controllers/ClienteController";
import { requireAuth, requireRol } from "../middlewares/authMiddleware";
import { RolSistema } from "../../domain/entities/Usuario";

export const clienteRoutes = Router();

// Crear cliente: SOLO ADMIN (decisión de Nelly: el Coordinador ya no crea
// catálogo, solo elige de listas ya cargadas al armar un evento).
clienteRoutes.post("/", requireAuth, requireRol(RolSistema.ADMIN), crearCliente);
// Listar: TODOS los roles autenticados lo necesitan — Coordinador para elegir
// un cliente al crear un evento, Productor/Cliente para llegar a la pestaña
// "Eventos" (que depende de tener un cliente seleccionado).
clienteRoutes.get("/", requireAuth, listarClientes);

// Dar de alta las CREDENCIALES de un cliente: es manejo de cuentas → SOLO ADMIN.
clienteRoutes.post("/:clienteId/usuario", requireAuth, requireRol(RolSistema.ADMIN), crearAccesoCliente);

// Editar datos / activar-desactivar un cliente: SOLO ADMIN (pediste que sea el único).
clienteRoutes.patch("/:clienteId", requireAuth, requireRol(RolSistema.ADMIN), actualizarCliente);
clienteRoutes.patch("/:clienteId/estado", requireAuth, requireRol(RolSistema.ADMIN), cambiarEstadoActivoCliente);
