import { Router } from "express";
import {
  crearEvento,
  listarEventosPorCliente,
  listarEventosAsignados,
  cambiarEstadoEvento,
  crearSede,
  listarSedesPorEvento,
  listarAsignacionesPorEvento,
  subirImagenEvento,
} from "../controllers/EventoController";
import { requireAuth, requireRol } from "../middlewares/authMiddleware";
import { RolSistema } from "../../domain/entities/Usuario";
import { uploadImagenEvento } from "../middlewares/uploadMiddleware";

export const eventoRoutes = Router();

// El Coordinador es el "amo y señor" del evento — crear eventos es EXCLUSIVO suyo.
// ADMIN ya no participa acá: es soporte técnico, no gestiona la operación del evento.
eventoRoutes.post("/", requireAuth, requireRol(RolSistema.COORDINADOR), crearEvento);
eventoRoutes.get("/cliente/:clienteId", requireAuth, listarEventosPorCliente);
// "Mis eventos" del Productor: ya no elige un cliente primero, ve directo
// los eventos donde quedó asignado como responsable (de cualquier cliente).
eventoRoutes.get("/asignados", requireAuth, requireRol(RolSistema.PRODUCTOR), listarEventosAsignados);
// Cambiar estado: EXCLUSIVO del Productor (decisión de Nelly) — es quien está
// físicamente en el evento y certifica cada transición con evidencia.
eventoRoutes.patch("/:id/estado", requireAuth, requireRol(RolSistema.PRODUCTOR), cambiarEstadoEvento);
// Los puntos/sedes los carga el Coordinador; verlos queda abierto a cualquier autenticado (Cliente/Productor incluidos).
eventoRoutes.post("/:eventoId/sedes", requireAuth, requireRol(RolSistema.COORDINADOR), crearSede);
eventoRoutes.get("/:eventoId/sedes", requireAuth, listarSedesPorEvento);
// Ver quién está asignado a un evento: mismo criterio que sedes, abierto a cualquier autenticado.
eventoRoutes.get("/:eventoId/asignaciones", requireAuth, listarAsignacionesPorEvento);
eventoRoutes.post(
  "/:id/imagen",
  requireAuth,
  requireRol(RolSistema.COORDINADOR),
  uploadImagenEvento.single("imagen"),
  subirImagenEvento,
);
