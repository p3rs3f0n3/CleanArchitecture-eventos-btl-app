/** Error de dominio para el frontend: envuelve cualquier respuesta HTTP no-2xx del backend. */
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
