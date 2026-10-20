-- AlterTable
ALTER TABLE "categorias" ADD COLUMN     "esGestion" BOOLEAN NOT NULL DEFAULT false;

-- Seed: categorías de gestión — el personal en estas categorías es el ÚNICO
-- que puede recibir un Usuario (Coordinador/Productor). Staff de evento
-- (Bartender, DJ, Modelo...) queda siempre con esGestion = false.
INSERT INTO "categorias" ("id", "nombre", "requiereMedidasFisicas", "esGestion") VALUES
  (gen_random_uuid(), 'Coordinador', false, true),
  (gen_random_uuid(), 'Productor', false, true)
ON CONFLICT ("nombre") DO UPDATE SET "esGestion" = true;
