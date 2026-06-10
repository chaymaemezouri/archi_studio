-- AlterTable
ALTER TABLE "Project" ADD COLUMN "totalProjectAmount" DOUBLE PRECISION;
ALTER TABLE "Project" ADD COLUMN "contractArchitectFees" DOUBLE PRECISION;
ALTER TABLE "Project" ADD COLUMN "actualFeesToCollect" DOUBLE PRECISION;

-- Migrate legacy budget to total project amount
UPDATE "Project" SET "totalProjectAmount" = "budget" WHERE "budget" IS NOT NULL AND "totalProjectAmount" IS NULL;
