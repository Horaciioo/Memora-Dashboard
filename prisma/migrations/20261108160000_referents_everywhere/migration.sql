-- Trainers are called Référents everywhere
ALTER TABLE "academy_session_trainers" RENAME TO "academy_session_referents";
ALTER TABLE "academy_session_referents" RENAME CONSTRAINT "academy_session_trainers_pkey" TO "academy_session_referents_pkey";
ALTER TABLE "academy_session_referents" RENAME CONSTRAINT "academy_session_trainers_sessionId_fkey" TO "academy_session_referents_sessionId_fkey";
ALTER TABLE "academy_session_referents" RENAME CONSTRAINT "academy_session_trainers_accountId_fkey" TO "academy_session_referents_accountId_fkey";
ALTER INDEX "academy_session_trainers_sessionId_accountId_key" RENAME TO "academy_session_referents_sessionId_accountId_key";

ALTER TABLE "academy_juniors" RENAME COLUMN "trainerId" TO "referentId";
ALTER TABLE "academy_juniors" RENAME CONSTRAINT "academy_juniors_trainerId_fkey" TO "academy_juniors_referentId_fkey";

ALTER TABLE "calendar_events" RENAME COLUMN "trainerId" TO "referentId";
ALTER TABLE "calendar_events" RENAME CONSTRAINT "calendar_events_trainerId_fkey" TO "calendar_events_referentId_fkey";
ALTER INDEX "calendar_events_trainerId_idx" RENAME TO "calendar_events_referentId_idx";

ALTER TYPE "EventPurpose" RENAME VALUE 'TRAINER_INTERVIEW' TO 'REFERENT_INTERVIEW';

-- Stored glyph key
UPDATE "job_functions" SET "icon" = 'functionReferent' WHERE "icon" = 'functionTrainer';
UPDATE "event_templates" SET "icon" = 'functionReferent' WHERE "icon" = 'functionTrainer';
