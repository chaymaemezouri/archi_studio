-- AlterTable Client: extended CRM fields
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "secondaryPhone" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "ice" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "taxId" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "rc" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "cnss" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE';

-- ClientNote
CREATE TABLE IF NOT EXISTS "ClientNote" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientNote_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ClientNote" ADD CONSTRAINT "ClientNote_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ClientDocument
CREATE TABLE IF NOT EXISTS "ClientDocument" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "docType" TEXT NOT NULL DEFAULT 'OTHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientDocument_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ClientDocument" ADD CONSTRAINT "ClientDocument_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ActivityLog clientId
ALTER TABLE "ActivityLog" ADD COLUMN IF NOT EXISTS "clientId" TEXT;

ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
