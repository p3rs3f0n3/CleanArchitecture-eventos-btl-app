import { Request, Response, NextFunction } from "express";
import { tokenGenerator } from "../../infrastructure/di";
import { UnauthorizedError } from "../../domain/exceptions/DomainError";
import { RolSistema } from "../../domain/entities/Usuario";

export interface AuthenticatedRequest extends Request {
  usuario?: { usuarioId: string; rol: string; clienteId?: string; personalId?: string };
}

/** Verifica el JWT del header Authorization y cuelga los datos del usuario en req.usuario. */
export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError("Falta el token de autenticación (header Authorization: Bearer <token>).");
  }
  const token = header.slice("Bearer ".length);
  req.usuario = tokenGenerator.verify(token);
  next();
}

/** Se usa DESPUÉS de requireAuth. Ej: requireRol(RolSistema.ADMIN, RolSistema.COORDINADOR) */
export function requireRol(...rolesPermitidos: RolSistema[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol as RolSistema)) {
      throw new UnauthorizedError("No tenés permisos para realizar esta acción.");
    }
    next();
  };
}
