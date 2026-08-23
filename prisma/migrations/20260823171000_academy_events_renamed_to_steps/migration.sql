-- Pure rename, every row and every constraint kept in place
ALTER TYPE "AcademyEventKind" RENAME TO "AcademyStepKind";

ALTER TABLE "academy_events" RENAME TO "academy_steps";

ALTER TABLE "academy_steps" RENAME CONSTRAINT "academy_events_pkey" TO "academy_steps_pkey";
ALTER TABLE "academy_steps" RENAME CONSTRAINT "academy_events_sessionId_fkey" TO "academy_steps_sessionId_fkey";
ALTER TABLE "academy_steps" RENAME CONSTRAINT "academy_events_juniorId_fkey" TO "academy_steps_juniorId_fkey";
ALTER TABLE "academy_steps" RENAME CONSTRAINT "academy_events_authorId_fkey" TO "academy_steps_authorId_fkey";

ALTER INDEX "academy_events_sessionId_scheduledAt_idx" RENAME TO "academy_steps_sessionId_scheduledAt_idx";
ALTER INDEX "academy_events_kind_idx" RENAME TO "academy_steps_kind_idx";
