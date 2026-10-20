-- AlterTable: nullable a propósito — los eventos existentes no tienen forma
-- de saber quién los creó, y no hace falta backfill (quedan sin dueño).
ALTER TABLE "eventos" ADD COLUMN "creadoPorId" TEXT;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
