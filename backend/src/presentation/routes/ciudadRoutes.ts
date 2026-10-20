import { Router } from "express";
import { crearCiudad, listarCiudades, eliminarCiudad } from "../controllers/CiudadController";
import { requireAuth, requireRol } from "../middlewares/authMiddleware";
import { RolSistema } from "../../domain/entities/Usuario";

export const ciudadRoutes = Router();

// Catálogo de ciudades: SOLO ADMIN lo mantiene. El Coordinador solo lo lista
// para elegir ciudad al cargar un punto/Sede.
ciudadRoutes.get("/", requireAuth, listarCiudades);
ciudadRoutes.post("/", requireAuth, requireRol(RolSistema.ADMIN), crearCiudad);
ciudadRoutes.delete("/:id", requireAuth, requireRol(RolSistema.ADMIN), eliminarCiudad);
