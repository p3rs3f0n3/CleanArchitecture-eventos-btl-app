/**
 * Puerto (interfaz) para la generación/verificación de tokens de sesión.
 * Los casos de uso de auth dependen de ESTO, no de la librería JWT directamente.
 */
export interface TokenPayload {
  usuarioId: string;
  rol: string;
}

export interface TokenGenerator {
  generate(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
