-- AlterTable
ALTER TABLE "Client" ADD COLUMN "firstName" TEXT;
ALTER TABLE "Client" ADD COLUMN "lastName" TEXT;
ALTER TABLE "Client" ADD COLUMN "cinNumber" TEXT;
ALTER TABLE "Client" ADD COLUMN "cinValidUntil" TIMESTAMP(3);
ALTER TABLE "Client" ADD COLUMN "cinDocumentUrl" TEXT;
ALTER TABLE "Client" ADD COLUMN "cinDocumentName" TEXT;
