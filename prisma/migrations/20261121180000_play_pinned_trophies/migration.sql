-- Trophies pinned on the profile showcase
ALTER TABLE "play_profiles" ADD COLUMN "pinnedTrophies" TEXT[] DEFAULT ARRAY[]::TEXT[];
