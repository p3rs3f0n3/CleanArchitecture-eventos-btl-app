import { Router } from "express";
import {
  obtenerInforme,
  agregarEntrada,
  agregarFoto,
  eliminarFoto,
  enviar,
  marcarAjustado,
  publicar,
} from "../controllers/InformeController";
import { requireAuth, requireRol } from "../middlewares/authMiddleware";
import { RolSistema } from "../../domain/entities/Usuario";
import { uploadFotoInforme } from "../middlewares/uploadMiddleware";

export const informeRoutes = Router();

// Ver el informe: el permiso fino (dueño/asignado, o PUBLICADO si es Cliente)
// se resuelve DENTRO del caso de uso — acá solo se exige estar logueado.
informeRoutes.get("/evento/:eventoId", requireAuth, obtenerInforme);

// Sumar una entrada (nunca pisa): el Productor la arranca y la suma en BORRADOR;
// el Coordinador la suma mientras no esté publicado. Ver permisosInforme.ts.
informeRoutes.post("/evento/:eventoId/entradas", requireAuth, requireRol(RolSistema.COORDINADOR, RolSistema.PRODUCTOR), agregarEntrada);

// Fotos: misma regla que las entradas.
informeRoutes.post(
  "/evento/:eventoId/fotos",
  requireAuth,
  requireRol(RolSistema.COORDINADOR, RolSistema.PRODUCTOR),
  uploadFotoInforme.single("foto"),
  agregarFoto,
);
informeRoutes.delete("/fotos/:fotoId", requireAuth, requireRol(RolSistema.COORDINADOR, RolSistema.PRODUCTOR), eliminarFoto);

// Enviar al Coordinador: EXCLUSIVO del Productor asignado. Cierra su parte.
informeRoutes.post("/evento/:eventoId/enviar", requireAuth, requireRol(RolSistema.PRODUCTOR), enviar);

// Ajustar y publicar: EXCLUSIVO del Coordinador dueño del evento.
informeRoutes.post("/evento/:eventoId/ajustar", requireAuth, requireRol(RolSistema.COORDINADOR), marcarAjustado);
informeRoutes.post("/evento/:eventoId/publicar", requireAuth, requireRol(RolSistema.COORDINADOR), publicar);
