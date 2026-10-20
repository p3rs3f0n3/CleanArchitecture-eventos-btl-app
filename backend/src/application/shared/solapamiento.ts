/**
 * Helper puro (sin dependencias de infraestructura) para saber si dos rangos
 * de fechas se cruzan. Lo usan los casos de uso de Personal — se extrajo
 * acá para no duplicar la misma lógica en dos lugares.
 */
export function haySolapamiento(inicioA: Date, finA: Date, inicioB: Date, finB: Date): boolean {
  return inicioA < finB && finA > inicioB;
}
