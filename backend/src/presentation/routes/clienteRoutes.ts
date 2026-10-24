import { Router } from "express";
import {
  crearCliente,
  listarClientes,
  obtenerClientePropio,
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
// Listar TODOS los clientes: ADMIN/COORDINADOR (catálogo completo) y
// PRODUCTOR (necesita resolver el nombre/estado del cliente dueño de CADA
// evento donde quedó asignado — ver MisEventosPanel.tsx). Bug real
// encontrado por Nelly: un CLIENTE podía pedir esto y ver a los demás
// clientes, porque antes estaba abierto a "cualquier autenticado". Un
// CLIENTE usa /me, no esto.
clienteRoutes.get("/", requireAuth, requireRol(RolSistema.ADMIN, RolSistema.COORDINADOR, RolSistema.PRODUCTOR), listarClientes);

// Un CLIENTE pide SU PROPIO registro (para ver sus datos y resolver sus
// eventos) sin poder listar a los demás. Va antes de "/:clienteId" en rutas
// futuras para no chocar con un parámetro.
clienteRoutes.get("/me", requireAuth, requireRol(RolSistema.CLIENTE), obtenerClientePropio);

// Dar de alta las CREDENCIALES de un cliente: es manejo de cuentas → SOLO ADMIN.
clienteRoutes.post("/:clienteId/usuario", requireAuth, requireRol(RolSistema.ADMIN), crearAccesoCliente);

// Editar datos / activar-desactivar un cliente: SOLO ADMIN (pediste que sea el único).
clienteRoutes.patch("/:clienteId", requireAuth, requireRol(RolSistema.ADMIN), actualizarCliente);
clienteRoutes.patch("/:clienteId/estado", requireAuth, requireRol(RolSistema.ADMIN), cambiarEstadoActivoCliente);
