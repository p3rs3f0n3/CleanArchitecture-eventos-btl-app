import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

// Config que usa el CLI de Prisma (migrate, generate) — separada de
// src/infrastructure/database/prisma.ts, que es la que usa la app en runtime.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrate: {
    adapter: async () => new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  },
});
