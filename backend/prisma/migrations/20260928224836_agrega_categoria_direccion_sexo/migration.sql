-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MASCULINO', 'FEMENINO', 'OTRO');

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "direccion" TEXT NOT NULL DEFAULT 'Sin especificar';

-- AlterTable
ALTER TABLE "personal" ADD COLUMN     "categoriaId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
ADD COLUMN     "direccion" TEXT NOT NULL DEFAULT 'Sin especificar',
ADD COLUMN     "estatura" DOUBLE PRECISION,
ADD COLUMN     "medidas" TEXT,
ADD COLUMN     "peso" DOUBLE PRECISION,
ADD COLUMN     "sexo" "Sexo" NOT NULL DEFAULT 'OTRO',
ADD COLUMN     "tallaRopa" TEXT;

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "requiereMedidasFisicas" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- Seed manual: la fila con este id fijo es la que usan por default los
-- registros de Personal creados ANTES de que "categoria" existiera. Tiene
-- que insertarse ACÁ, antes del FOREIGN KEY de más abajo, porque el default
-- de "personal"."categoriaId" ya apunta a este id.
INSERT INTO "categorias" ("id", "nombre", "requiereMedidasFisicas") VALUES
  ('00000000-0000-0000-0000-000000000001', 'Sin especificar', false),
  (gen_random_uuid(), 'Bartender', false),
  (gen_random_uuid(), 'DJ', false),
  (gen_random_uuid(), 'Modelo', true),
  (gen_random_uuid(), 'Payaso', false),
  (gen_random_uuid(), 'Impulsador/a', false);

-- AddForeignKey
ALTER TABLE "personal" ADD CONSTRAINT "personal_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
