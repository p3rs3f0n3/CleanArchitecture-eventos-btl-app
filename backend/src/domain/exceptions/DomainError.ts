/**
 * Clase abstracta raíz para todas las violaciones de reglas de negocio.
 * Garantiza que nuestra capa central permanezca agnóstica de los protocolos
 * de transporte (HTTP/WebSockets) — el dominio nunca lanza un error "genérico"
 * de JavaScript, siempre uno propio que las capas de arriba pueden identificar.
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** Se rompió una invariante al crear/modificar una entidad (ej: fechas inválidas). */
export class InvalidPropValueError extends DomainError {}

/** Se buscó una entidad por id y no existe. El controller la mapea a HTTP 404. */
export class NotFoundError extends DomainError {}

/** Una regla de negocio de orden superior impide la operación (ej: cruce de horario). El controller la mapea a HTTP 409. */
export class ConflictError extends DomainError {}

/** Credenciales inválidas o falta de permisos. El controller la mapea a HTTP 401/403. */
export class UnauthorizedError extends DomainError {}
