-- CreateTable
CREATE TABLE "ciudades" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ciudades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ciudades_nombre_key" ON "ciudades"("nombre");

-- Seed manual: cada valor DISTINTO que ya existía en "sedes"."ciudad" pasa a
-- ser una fila de "ciudades" — así ninguna Sede existente queda huérfana.
INSERT INTO "ciudades" ("id", "nombre")
SELECT gen_random_uuid(), t."ciudad"
FROM (SELECT DISTINCT "ciudad" FROM "sedes") AS t;

-- AlterTable: se agrega la FK nueva ANTES de borrar la columna vieja, para
-- poder copiar el dato haciendo el match por nombre.
ALTER TABLE "sedes" ADD COLUMN "ciudadId" TEXT;

UPDATE "sedes" s
SET "ciudadId" = c."id"
FROM "ciudades" c
WHERE c."nombre" = s."ciudad";

ALTER TABLE "sedes" ALTER COLUMN "ciudadId" SET NOT NULL;
ALTER TABLE "sedes" DROP COLUMN "ciudad";

-- AddForeignKey
ALTER TABLE "sedes" ADD CONSTRAINT "sedes_ciudadId_fkey" FOREIGN KEY ("ciudadId") REFERENCES "ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
