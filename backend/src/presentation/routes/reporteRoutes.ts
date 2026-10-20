import { Router } from "express";
import { crearReporte } from "../controllers/ReporteController";
import { requireAuth } from "../middlewares/authMiddleware";

export const reporteRoutes = Router();

reporteRoutes.post("/", requireAuth, crearReporte);
