-- Event types become templates, and every entry gains the anchored kind it draws as.
-- Rows are copied before the old table goes, so nothing declared is lost.

CREATE TYPE "CalendarKind" AS ENUM ('ZONE', 'PERIOD', 'EVENT');

CREATE TABLE "event_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "CalendarKind" NOT NULL DEFAULT 'EVENT',
    "summary" TEXT,
    "body" TEXT,
    "accent" TEXT,
    "visibility" "EventVisibility" NOT NULL DEFAULT 'EVERYONE',
    "defaultMinutes" INTEGER,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "event_templates_name_key" ON "event_templates"("name");
CREATE INDEX "event_templates_archived_idx" ON "event_templates"("archived");
CREATE INDEX "event_templates_kind_idx" ON "event_templates"("kind");

-- Identifiers are kept so the entries already pointing at a type need no lookup
INSERT INTO "event_templates" ("id", "name", "summary", "accent", "visibility", "position", "archived", "createdAt", "updatedAt")
SELECT "id", "name", "summary", "accent", "visibility", "position", "archived", "createdAt", "updatedAt"
FROM "event_types";

ALTER TABLE "calendar_events" ADD COLUMN "kind" "CalendarKind" NOT NULL DEFAULT 'EVENT';
ALTER TABLE "calendar_events" ADD COLUMN "templateId" TEXT;
ALTER TABLE "calendar_events" ADD COLUMN "accent" TEXT;
ALTER TABLE "calendar_events" ADD COLUMN "accountId" TEXT;

UPDATE "calendar_events" SET "templateId" = "typeId";

ALTER TABLE "calendar_events" DROP CONSTRAINT "calendar_events_typeId_fkey";
DROP INDEX "calendar_events_typeId_idx";
ALTER TABLE "calendar_events" DROP COLUMN "typeId";

DROP TABLE "event_types";

CREATE INDEX "calendar_events_kind_startsAt_idx" ON "calendar_events"("kind", "startsAt");
CREATE INDEX "calendar_events_templateId_idx" ON "calendar_events"("templateId");
CREATE INDEX "calendar_events_accountId_idx" ON "calendar_events"("accountId");

ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "event_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
