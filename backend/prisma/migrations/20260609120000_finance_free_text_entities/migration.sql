-- AlterTable
ALTER TABLE "Devis" ADD COLUMN "studioId" TEXT,
ADD COLUMN "clientName" TEXT,
ADD COLUMN "projectName" TEXT;

ALTER TABLE "Invoice" ADD COLUMN "studioId" TEXT,
ADD COLUMN "clientName" TEXT,
ADD COLUMN "projectName" TEXT;

UPDATE "Devis" d SET "studioId" = c."studioId" FROM "Client" c WHERE d."clientId" = c.id;
UPDATE "Devis" d SET "studioId" = p."studioId" FROM "Project" p WHERE d."projectId" = p.id AND d."studioId" IS NULL;

UPDATE "Invoice" i SET "studioId" = c."studioId" FROM "Client" c WHERE i."clientId" = c.id;
UPDATE "Invoice" i SET "studioId" = p."studioId" FROM "Project" p WHERE i."projectId" = p.id AND i."studioId" IS NULL;

ALTER TABLE "Devis" ADD CONSTRAINT "Devis_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
