-- Annual reviews live on the calendar as empty slots, a model carries the slot length
DROP TABLE IF EXISTS "annual_reviews";
DROP TABLE IF EXISTS "annual_review_windows";
DROP TABLE IF EXISTS "annual_review_periods";

ALTER TABLE "event_templates" ADD COLUMN "slotMinutes" INTEGER;
