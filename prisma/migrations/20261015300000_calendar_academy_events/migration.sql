-- Create enum
CREATE TYPE "EventPurpose" AS ENUM ('TRAINER_INTERVIEW', 'PANEL_INTERVIEW', 'REVIEW_ONE', 'REVIEW_FINAL');

-- Columns
ALTER TABLE "event_templates" ADD COLUMN "purpose" "EventPurpose";
ALTER TABLE "calendar_events" ADD COLUMN "juniorId" TEXT;

-- Indexes
CREATE UNIQUE INDEX "event_templates_purpose_key" ON "event_templates"("purpose");
CREATE INDEX "calendar_events_juniorId_idx" ON "calendar_events"("juniorId");

-- Foreign keys
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_juniorId_fkey" FOREIGN KEY ("juniorId") REFERENCES "academy_juniors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
