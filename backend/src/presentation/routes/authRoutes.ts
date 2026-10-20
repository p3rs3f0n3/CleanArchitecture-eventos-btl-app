import { Router } from "express";
import { register, login, cambiarPassword } from "../controllers/AuthController";
import { requireAuth } from "../middlewares/authMiddleware";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.patch("/password", requireAuth, cambiarPassword);
