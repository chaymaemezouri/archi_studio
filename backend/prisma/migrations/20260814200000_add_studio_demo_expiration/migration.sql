-- AlterTable
ALTER TABLE "Studio" ADD COLUMN "demoExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Studio_demoExpiresAt_idx" ON "Studio"("demoExpiresAt");
