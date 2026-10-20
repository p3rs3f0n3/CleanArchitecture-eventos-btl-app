import { Router } from "express";
import { listarUsuarios, cambiarEstadoActivoUsuario, resetearPasswordUsuario } from "../controllers/UsuarioController";
import { requireAuth, requireRol } from "../middlewares/authMiddleware";
import { RolSistema } from "../../domain/entities/Usuario";

export const usuarioRoutes = Router();

// Todo el módulo de administración de cuentas es EXCLUSIVO de ADMIN.
usuarioRoutes.get("/", requireAuth, requireRol(RolSistema.ADMIN), listarUsuarios);
usuarioRoutes.patch("/:usuarioId/estado", requireAuth, requireRol(RolSistema.ADMIN), cambiarEstadoActivoUsuario);
usuarioRoutes.patch("/:usuarioId/password", requireAuth, requireRol(RolSistema.ADMIN), resetearPasswordUsuario);
