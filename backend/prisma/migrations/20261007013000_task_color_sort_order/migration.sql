-- AlterTable Task: couleur perso + ordre d'importance
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "color" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "Task_studioId_sortOrder_idx" ON "Task"("studioId", "sortOrder");

-- AlterTable CalendarEvent: couleur perso optionnelle
ALTER TABLE "CalendarEvent" ADD COLUMN IF NOT EXISTS "color" TEXT;
