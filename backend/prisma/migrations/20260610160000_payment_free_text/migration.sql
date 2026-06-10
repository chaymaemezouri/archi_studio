-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "studioId" TEXT,
ADD COLUMN "invoiceName" TEXT,
ADD COLUMN "clientName" TEXT,
ADD COLUMN "projectName" TEXT;

UPDATE "Payment" p SET "studioId" = c."studioId"
FROM "Client" c WHERE p."clientId" = c.id;

UPDATE "Payment" p SET "studioId" = pr."studioId"
FROM "Project" pr WHERE p."projectId" = pr.id AND p."studioId" IS NULL;

UPDATE "Payment" p SET "studioId" = i."studioId"
FROM "Invoice" i WHERE p."invoiceId" = i.id AND p."studioId" IS NULL;

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
