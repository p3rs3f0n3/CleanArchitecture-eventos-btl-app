/**
 * Puerto (interfaz) para la generación/verificación de tokens de sesión.
 * Los casos de uso de auth dependen de ESTO, no de la librería JWT directamente.
 */
export interface TokenPayload {
  usuarioId: string;
  rol: string;
  // Resuelven "quién soy yo" sin ida y vuelta a la base — ej: un CLIENTE
  // pidiendo SUS propios eventos, no necesita que el backend vuelva a
  // buscar su clienteId en cada request.
  clienteId?: string;
  personalId?: string;
}

export interface TokenGenerator {
  generate(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
