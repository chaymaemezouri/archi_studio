-- CreateTable
CREATE TABLE "SharedNote" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SharedNote_studioId_createdAt_idx" ON "SharedNote"("studioId", "createdAt");

-- AddForeignKey
ALTER TABLE "SharedNote" ADD CONSTRAINT "SharedNote_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedNote" ADD CONSTRAINT "SharedNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
