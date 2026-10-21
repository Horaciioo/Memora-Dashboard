-- A model carries its glyph, whether it always calls the roll, the platform of a live, and the team and slot of a team meeting
ALTER TABLE "event_templates" ADD COLUMN "icon" TEXT;
ALTER TABLE "event_templates" ADD COLUMN "rollCall" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "event_templates" ADD COLUMN "platform" "LivePlatform";
ALTER TABLE "event_templates" ADD COLUMN "functionName" TEXT;
ALTER TABLE "event_templates" ADD COLUMN "weekday" INTEGER;
ALTER TABLE "event_templates" ADD COLUMN "startTime" TEXT;

-- The single Live model becomes the YouTube one, the Twitch one is created by the sync
UPDATE "event_templates" SET "name" = 'Live YouTube', "platform" = 'YOUTUBE', "icon" = 'youtube' WHERE "name" = 'Live';
