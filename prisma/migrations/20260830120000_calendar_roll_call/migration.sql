-- Roll-call events: an entry may now ask its convened members to confirm presence.

CREATE TYPE "AttendanceStatus" AS ENUM ('PENDING', 'PRESENT', 'ABSENT');

ALTER TABLE "calendar_events" ADD COLUMN "rollCall" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "calendar_events" ADD COLUMN "rosterShared" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "calendar_events" ADD COLUMN "rollCallTeamIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "calendar_events" ADD COLUMN "remindAt" TIMESTAMP(3);
ALTER TABLE "calendar_events" ADD COLUMN "remindedAt" TIMESTAMP(3);

CREATE INDEX "calendar_events_rollCall_remindAt_remindedAt_idx" ON "calendar_events"("rollCall", "remindAt", "remindedAt");

CREATE TABLE "event_attendances" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_attendances_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "event_attendances_eventId_accountId_key" ON "event_attendances"("eventId", "accountId");
CREATE INDEX "event_attendances_accountId_status_idx" ON "event_attendances"("accountId", "status");

ALTER TABLE "event_attendances" ADD CONSTRAINT "event_attendances_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "calendar_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_attendances" ADD CONSTRAINT "event_attendances_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
