import { Request, Response, NextFunction } from "express";
import {
  DomainError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  InvalidPropValueError,
} from "../../domain/exceptions/DomainError";

/**
 * Traduce las excepciones de DOMINIO a códigos de estado HTTP. Es la ÚNICA
 * capa que sabe qué es un "404" o un "409" — el dominio y los casos de uso
 * nunca importan Express, por eso lanzan estas excepciones propias en vez
 * de manejar códigos HTTP directamente.
 *
 * Express 5 reenvía automáticamente los rechazos de promesas de handlers
 * async hacia este middleware (a diferencia de Express 4) — por eso los
 * controllers no necesitan try/catch ni un wrapper "asyncHandler".
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }
  if (err instanceof ConflictError) {
    res.status(409).json({ error: err.message });
    return;
  }
  if (err instanceof UnauthorizedError) {
    res.status(401).json({ error: err.message });
    return;
  }
  if (err instanceof InvalidPropValueError) {
    res.status(400).json({ error: err.message });
    return;
  }
  if (err instanceof DomainError) {
    res.status(400).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
}
