-- Play members remember when they last left
ALTER TABLE "play_profiles" ADD COLUMN "lastSeenAt" TIMESTAMP(3);
