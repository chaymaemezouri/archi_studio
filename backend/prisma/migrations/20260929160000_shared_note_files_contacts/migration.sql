-- AlterTable
ALTER TABLE "SharedNote" ALTER COLUMN "content" SET DEFAULT '';
ALTER TABLE "SharedNote" ADD COLUMN "contactName" TEXT;
ALTER TABLE "SharedNote" ADD COLUMN "contactPhone" TEXT;
ALTER TABLE "SharedNote" ADD COLUMN "contactEmail" TEXT;

-- CreateTable
CREATE TABLE "SharedNoteFile" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedNoteFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SharedNoteFile_noteId_idx" ON "SharedNoteFile"("noteId");

-- AddForeignKey
ALTER TABLE "SharedNoteFile" ADD CONSTRAINT "SharedNoteFile_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "SharedNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
