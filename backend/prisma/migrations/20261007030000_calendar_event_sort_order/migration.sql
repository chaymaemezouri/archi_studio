-- AlterTable CalendarEvent: ordre d'importance dans la journée
ALTER TABLE "CalendarEvent" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "CalendarEvent_studioId_sortOrder_idx" ON "CalendarEvent"("studioId", "sortOrder");
