import { Router } from "express";
import {
  crearPersonal,
  asignarPersonalAEvento,
  listarPersonalDisponible,
  crearAccesoPersonal,
  listarPersonal,
  actualizarPersonal,
  cambiarEstadoActivoPersonal,
  subirFotoPersonal,
} from "../controllers/PersonalController";
import { requireAuth, requireRol } from "../middlewares/authMiddleware";
import { RolSistema } from "../../domain/entities/Usuario";
import { uploadFotoPersonal } from "../middlewares/uploadMiddleware";

export const personalRoutes = Router();

// Crear personal/staff: SOLO ADMIN (decisión de Nelly: el Coordinador ya no
// crea catálogo, solo elige de listas ya cargadas al armar un evento).
personalRoutes.post("/", requireAuth, requireRol(RolSistema.ADMIN), crearPersonal);
// Listar: TODOS los roles autenticados lo necesitan — Coordinador para armar
// el staff de un evento, Productor/Cliente para ver los nombres en el
// resumen de "staff asignado" del modal de gestión del evento.
personalRoutes.get("/", requireAuth, listarPersonal);
// Editar datos / activar-desactivar / foto de un Personal: SOLO ADMIN (mismo criterio que Cliente).
personalRoutes.patch("/:personalId", requireAuth, requireRol(RolSistema.ADMIN), actualizarPersonal);
personalRoutes.patch("/:personalId/estado", requireAuth, requireRol(RolSistema.ADMIN), cambiarEstadoActivoPersonal);
personalRoutes.post(
  "/:personalId/foto",
  requireAuth,
  requireRol(RolSistema.ADMIN),
  uploadFotoPersonal.single("foto"),
  subirFotoPersonal,
);
// Dar de alta las CREDENCIALES (Coordinador/Productor) de un Personal ya existente: manejo de cuentas → SOLO ADMIN.
personalRoutes.post("/:personalId/usuario", requireAuth, requireRol(RolSistema.ADMIN), crearAccesoPersonal);
// Asignar personal a un evento es 100% operación del evento → EXCLUSIVO del Coordinador.
personalRoutes.get("/disponibles", requireAuth, requireRol(RolSistema.COORDINADOR), listarPersonalDisponible);
personalRoutes.post("/asignaciones", requireAuth, requireRol(RolSistema.COORDINADOR), asignarPersonalAEvento);
