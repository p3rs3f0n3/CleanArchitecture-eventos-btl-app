-- CreateEnum
CREATE TYPE "EstadoInforme" AS ENUM ('BORRADOR', 'AJUSTADO', 'PUBLICADO');

-- CreateTable
CREATE TABLE "informes" (
    "id" TEXT NOT NULL,
    "estado" "EstadoInforme" NOT NULL DEFAULT 'BORRADOR',
    "novedades" TEXT,
    "observaciones" TEXT,
    "relacionPremios" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventoId" TEXT NOT NULL,
    "creadoPorId" TEXT,
    "ajustadoPorId" TEXT,

    CONSTRAINT "informes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos_informe" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "informeId" TEXT NOT NULL,

    CONSTRAINT "fotos_informe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "informes_eventoId_key" ON "informes"("eventoId");

-- AddForeignKey
ALTER TABLE "informes" ADD CONSTRAINT "informes_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "informes" ADD CONSTRAINT "informes_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "informes" ADD CONSTRAINT "informes_ajustadoPorId_fkey" FOREIGN KEY ("ajustadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_informe" ADD CONSTRAINT "fotos_informe_informeId_fkey" FOREIGN KEY ("informeId") REFERENCES "informes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
