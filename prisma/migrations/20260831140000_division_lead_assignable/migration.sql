-- Cleared, only an administrator may put a member in this division
ALTER TABLE "divisions" ADD COLUMN "leadAssignable" BOOLEAN NOT NULL DEFAULT true;
