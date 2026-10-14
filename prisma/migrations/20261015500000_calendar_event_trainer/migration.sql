-- Columns
ALTER TABLE "calendar_events" ADD COLUMN "trainerId" TEXT;

-- Indexes
CREATE INDEX "calendar_events_trainerId_idx" ON "calendar_events"("trainerId");

-- Foreign keys
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
