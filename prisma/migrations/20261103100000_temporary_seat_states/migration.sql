-- Access taken away and archives deleted, on the seats a temporary function holds
ALTER TABLE "academy_session_trainers" ADD COLUMN "revokedAt" TIMESTAMP(3), ADD COLUMN "forgottenAt" TIMESTAMP(3);
ALTER TABLE "recruitment_recruiters" ADD COLUMN "revokedAt" TIMESTAMP(3), ADD COLUMN "forgottenAt" TIMESTAMP(3);
ALTER TABLE "recruitment_observers" ADD COLUMN "revokedAt" TIMESTAMP(3), ADD COLUMN "forgottenAt" TIMESTAMP(3);
