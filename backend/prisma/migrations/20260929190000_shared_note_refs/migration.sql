-- CreateTable
CREATE TABLE "SharedNoteRef" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "href" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedNoteRef_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SharedNoteRef_noteId_idx" ON "SharedNoteRef"("noteId");

-- AddForeignKey
ALTER TABLE "SharedNoteRef" ADD CONSTRAINT "SharedNoteRef_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "SharedNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
