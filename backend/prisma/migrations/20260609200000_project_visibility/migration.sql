-- CreateEnum
CREATE TYPE "ProjectVisibility" AS ENUM ('STUDIO', 'PERSONAL');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "visibility" "ProjectVisibility" NOT NULL DEFAULT 'STUDIO';
ALTER TABLE "Project" ADD COLUMN "ownerId" TEXT;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
