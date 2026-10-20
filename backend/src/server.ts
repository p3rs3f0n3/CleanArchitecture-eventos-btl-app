import express from "express";
import cors from "cors";
import { env } from "./infrastructure/config/env";
import { errorHandler } from "./presentation/middlewares/errorHandler";
import { authRoutes } from "./presentation/routes/authRoutes";
import { eventoRoutes } from "./presentation/routes/eventoRoutes";
import { clienteRoutes } from "./presentation/routes/clienteRoutes";
import { personalRoutes } from "./presentation/routes/personalRoutes";
import { reporteRoutes } from "./presentation/routes/reporteRoutes";
import { usuarioRoutes } from "./presentation/routes/usuarioRoutes";
import { categoriaRoutes } from "./presentation/routes/categoriaRoutes";
import { ciudadRoutes } from "./presentation/routes/ciudadRoutes";
import { informeRoutes } from "./presentation/routes/informeRoutes";

const app = express();

app.use(cors());
app.use(express.json());
// Sirve las fotos subidas (ver uploadMiddleware.ts) — la URL que se guarda en
// Personal.fotoUrl apunta acá.
app.use("/uploads", express.static("uploads"));

// Requisito del entregable: "Endpoint público base o Health Check".
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/eventos", eventoRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/personal", personalRoutes);
app.use("/api/reportes", reporteRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/ciudades", ciudadRoutes);
app.use("/api/informes", informeRoutes);

// El manejador de errores SIEMPRE va al final, después de todas las rutas.
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Servidor escuchando en http://localhost:${env.port}`);
});
