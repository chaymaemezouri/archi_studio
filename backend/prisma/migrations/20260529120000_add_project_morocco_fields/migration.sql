-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('PRIVATE', 'PUBLIC', 'STATE');
CREATE TYPE "ProjectScale" AS ENUM ('SMALL', 'LARGE');
CREATE TYPE "ChecklistItemStatus" AS ENUM ('MISSING', 'UPLOADED', 'VALIDATED');

-- AlterEnum
ALTER TYPE "ProjectPhase" ADD VALUE 'CONSULTATION';
ALTER TYPE "ProjectPhase" ADD VALUE 'CPS';
ALTER TYPE "ProjectPhase" ADD VALUE 'AUTORISATION';
ALTER TYPE "ProjectPhase" ADD VALUE 'DOSSIER_EXECUTION';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "projectNature" TEXT,
ADD COLUMN "projectCategory" "ProjectCategory" NOT NULL DEFAULT 'PRIVATE',
ADD COLUMN "projectScale" "ProjectScale",
ADD COLUMN "intakeDate" TIMESTAMP(3),
ADD COLUMN "titleSurface" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ProjectChecklistItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "ChecklistItemStatus" NOT NULL DEFAULT 'MISSING',
    "fileUrl" TEXT,
    "documentId" TEXT,
    "uploadedAt" TIMESTAMP(3),
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectChecklistItem_projectId_idx" ON "ProjectChecklistItem"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectChecklistItem" ADD CONSTRAINT "ProjectChecklistItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
