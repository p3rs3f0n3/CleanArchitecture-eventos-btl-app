/**
 * Normaliza texto para comparar duplicados ignorando mayúsculas/minúsculas Y
 * tildes — "Cali", "cali" y "calí" tienen que detectarse como la misma
 * ciudad. `mode: "insensitive"` de Postgres/Prisma solo cubre mayúsculas, no
 * acentos, así que esta comparación se hace en memoria, no en la query.
 */
export function normalizarParaComparar(texto: string): string {
  return texto
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}
