-- CreateTable
CREATE TABLE "Studio" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Studio_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Studio_slug_key" ON "Studio"("slug");

-- Seed default studios
INSERT INTO "Studio" ("id", "slug", "name", "logoUrl", "updatedAt")
VALUES
  ('studio_amini', 'amini', 'Amini Architects', '/studios/amini.png', CURRENT_TIMESTAMP),
  ('studio_maouni', 'maouni', 'Maouni Architecture', '/studios/maouni.png', CURRENT_TIMESTAMP);

-- User.studioId
ALTER TABLE "User" ADD COLUMN "studioId" TEXT;
UPDATE "User" SET "studioId" = 'studio_amini' WHERE "studioId" IS NULL;
ALTER TABLE "User" ALTER COLUMN "studioId" SET NOT NULL;
ALTER TABLE "User" ADD CONSTRAINT "User_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Client.studioId
ALTER TABLE "Client" ADD COLUMN "studioId" TEXT;
UPDATE "Client" SET "studioId" = 'studio_amini' WHERE "studioId" IS NULL;
ALTER TABLE "Client" ALTER COLUMN "studioId" SET NOT NULL;
ALTER TABLE "Client" ADD CONSTRAINT "Client_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Project.studioId
ALTER TABLE "Project" ADD COLUMN "studioId" TEXT;
UPDATE "Project" SET "studioId" = 'studio_amini' WHERE "studioId" IS NULL;
ALTER TABLE "Project" ALTER COLUMN "studioId" SET NOT NULL;
ALTER TABLE "Project" ADD CONSTRAINT "Project_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Tender.studioId
ALTER TABLE "Tender" ADD COLUMN "studioId" TEXT;
UPDATE "Tender" SET "studioId" = 'studio_amini' WHERE "studioId" IS NULL;
ALTER TABLE "Tender" ALTER COLUMN "studioId" SET NOT NULL;
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Settings: migrate from singleton to per-studio
ALTER TABLE "Settings" ADD COLUMN "studioId" TEXT;

INSERT INTO "Settings" ("id", "studioId", "cabinetName", "tvaDefault", "invoicePrefix", "devisPrefix", "updatedAt")
SELECT
  'settings_amini',
  'studio_amini',
  'Amini Architects',
  COALESCE((SELECT "tvaDefault" FROM "Settings" WHERE "id" = 'singleton' LIMIT 1), 20),
  COALESCE((SELECT "invoicePrefix" FROM "Settings" WHERE "id" = 'singleton' LIMIT 1), 'FAC'),
  COALESCE((SELECT "devisPrefix" FROM "Settings" WHERE "id" = 'singleton' LIMIT 1), 'DEV'),
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Settings" WHERE "studioId" = 'studio_amini');

INSERT INTO "Settings" ("id", "studioId", "cabinetName", "tvaDefault", "invoicePrefix", "devisPrefix", "updatedAt")
VALUES (
  'settings_maouni',
  'studio_maouni',
  'Maouni Architecture',
  20,
  'FAC',
  'DEV',
  CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

UPDATE "Settings" SET "studioId" = 'studio_amini' WHERE "id" = 'singleton' AND "studioId" IS NULL;
DELETE FROM "Settings" WHERE "id" = 'singleton';

ALTER TABLE "Settings" ALTER COLUMN "studioId" SET NOT NULL;
CREATE UNIQUE INDEX "Settings_studioId_key" ON "Settings"("studioId");
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
