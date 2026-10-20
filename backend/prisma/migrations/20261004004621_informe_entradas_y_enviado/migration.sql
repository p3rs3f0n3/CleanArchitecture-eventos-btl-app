-- Estado intermedio: el Productor "envía" y el Coordinador ajusta.
ALTER TYPE "EstadoInforme" ADD VALUE 'ENVIADO' BEFORE 'AJUSTADO';

-- CreateEnum
CREATE TYPE "TipoEntradaInforme" AS ENUM ('NOVEDAD', 'OBSERVACION', 'PREMIO');

-- CreateTable
CREATE TABLE "entradas_informe" (
    "id" TEXT NOT NULL,
    "tipo" "TipoEntradaInforme" NOT NULL,
    "texto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "informeId" TEXT NOT NULL,
    "autorId" TEXT,

    CONSTRAINT "entradas_informe_pkey" PRIMARY KEY ("id")
);

-- Migración de datos: cada texto no vacío de las columnas viejas pasa a ser una entrada.
-- Autor = creadoPorId (quien armó el informe); fecha = createdAt del informe.
INSERT INTO "entradas_informe" ("id", "tipo", "texto", "createdAt", "informeId", "autorId")
SELECT gen_random_uuid()::text, 'NOVEDAD', "novedades", "createdAt", "id", "creadoPorId"
FROM "informes" WHERE "novedades" IS NOT NULL AND btrim("novedades") <> '';

INSERT INTO "entradas_informe" ("id", "tipo", "texto", "createdAt", "informeId", "autorId")
SELECT gen_random_uuid()::text, 'OBSERVACION', "observaciones", "createdAt", "id", "creadoPorId"
FROM "informes" WHERE "observaciones" IS NOT NULL AND btrim("observaciones") <> '';

INSERT INTO "entradas_informe" ("id", "tipo", "texto", "createdAt", "informeId", "autorId")
SELECT gen_random_uuid()::text, 'PREMIO', "relacionPremios", "createdAt", "id", "creadoPorId"
FROM "informes" WHERE "relacionPremios" IS NOT NULL AND btrim("relacionPremios") <> '';

-- AlterTable: el contenido ya vive en entradas_informe
ALTER TABLE "informes" DROP COLUMN "novedades",
DROP COLUMN "observaciones",
DROP COLUMN "relacionPremios";

-- AddForeignKey
ALTER TABLE "entradas_informe" ADD CONSTRAINT "entradas_informe_informeId_fkey" FOREIGN KEY ("informeId") REFERENCES "informes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entradas_informe" ADD CONSTRAINT "entradas_informe_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
