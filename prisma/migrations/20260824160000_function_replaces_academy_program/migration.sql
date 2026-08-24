-- Job functions backing the four former programmes, reusing Twitch/Discord if the skill seed already created them
INSERT INTO "job_functions" ("id", "name", "kind", "accent", "position", "createdAt", "updatedAt")
VALUES
  ('function-twitch', 'Twitch', 'PRIMARY', 'brand', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('function-youtube', 'Youtube', 'PRIMARY', 'danger', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('function-discord', 'Discord', 'PRIMARY', 'info', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('function-polyvalent', 'Polyvalent', 'PRIMARY', 'success', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- AlterTable, nullable first so the backfill below can run
ALTER TABLE "academy_sessions" ADD COLUMN "functionId" TEXT;

-- Backfill every session from its former programme
UPDATE "academy_sessions" AS s SET "functionId" = jf."id"
FROM "job_functions" jf
WHERE jf."name" = CASE s."program"
  WHEN 'PIMT' THEN 'Twitch'
  WHEN 'PIMY' THEN 'Youtube'
  WHEN 'PIMD' THEN 'Discord'
  WHEN 'PIMP' THEN 'Polyvalent'
END;

-- Every session now has a function, the column can be required
ALTER TABLE "academy_sessions" ALTER COLUMN "functionId" SET NOT NULL;

-- DropIndex
DROP INDEX "academy_sessions_program_startsAt_idx";

ALTER TABLE "academy_sessions" DROP COLUMN "program";

-- CreateIndex
CREATE INDEX "academy_sessions_functionId_startsAt_idx" ON "academy_sessions"("functionId", "startsAt");

-- AddForeignKey
ALTER TABLE "academy_sessions" ADD CONSTRAINT "academy_sessions_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Session lifecycle grows from three to five states, admissions and archival now have their own state
ALTER TYPE "AcademySessionStatus" RENAME VALUE 'PLANNED' TO 'DRAFT';
ALTER TYPE "AcademySessionStatus" ADD VALUE 'OPEN' AFTER 'DRAFT';
ALTER TYPE "AcademySessionStatus" ADD VALUE 'ARCHIVED' AFTER 'CLOSED';

-- Training now filters by function and dispositif instead of carrying its own programme
ALTER TABLE "trainings" ADD COLUMN "dispositifId" TEXT;

-- DropIndex
DROP INDEX "trainings_program_idx";

ALTER TABLE "trainings" DROP COLUMN "program";

-- CreateIndex
CREATE INDEX "trainings_functionId_dispositifId_idx" ON "trainings"("functionId", "dispositifId");

-- AddForeignKey
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_dispositifId_fkey" FOREIGN KEY ("dispositifId") REFERENCES "dispositifs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropEnum
DROP TYPE "AcademyProgram";

-- A moderator's academy progression is now read off their FSI, not stored on the account
ALTER TABLE "accounts" DROP COLUMN "academyPeriod";
