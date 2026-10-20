import { Router } from "express";
import { crearCategoria, listarCategorias } from "../controllers/CategoriaController";
import { requireAuth, requireRol } from "../middlewares/authMiddleware";
import { RolSistema } from "../../domain/entities/Usuario";

export const categoriaRoutes = Router();

// Catálogo de categorías: SOLO ADMIN lo mantiene. Listar queda abierto a
// cualquier autenticado — mismo criterio que clientes/personal: Productor
// (y Cliente) necesitan resolver el nombre de categoría del staff asignado
// en el resumen del evento, no solo el Coordinador al armarlo.
categoriaRoutes.get("/", requireAuth, listarCategorias);
categoriaRoutes.post("/", requireAuth, requireRol(RolSistema.ADMIN), crearCategoria);
