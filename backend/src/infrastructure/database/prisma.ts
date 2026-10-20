import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";

// Desde Prisma 7, PrismaClient ya no lee DATABASE_URL solo con el schema —
// necesita un "driver adapter" explícito para saber CÓMO conectarse.
const adapter = new PrismaPg({ connectionString: env.databaseUrl });

/**
 * Instancia única (singleton) de PrismaClient para toda la aplicación.
 * Evita abrir una conexión nueva a la base de datos en cada request.
 */
export const prisma = new PrismaClient({ adapter });
