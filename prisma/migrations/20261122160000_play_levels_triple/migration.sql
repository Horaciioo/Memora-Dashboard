-- Level ladder costs three times more, XP is tripled so every player keeps their level
ALTER TABLE "play_profiles" ADD COLUMN "levelNotice" BOOLEAN NOT NULL DEFAULT false;

UPDATE "play_game_stats"
SET "xp" = GREATEST(LEAST("xp"::bigint * 3, 2147483647), -2147483648)::integer;

UPDATE "play_profiles"
SET "bonusXp" = GREATEST(LEAST("bonusXp"::bigint * 3, 2147483647), -2147483648)::integer;

UPDATE "play_trophy_wins"
SET "xp" = GREATEST(LEAST("xp"::bigint * 3, 2147483647), -2147483648)::integer;

-- Players with a past in Play get a profile to carry the notice
INSERT INTO "play_profiles" ("accountId", "updatedAt")
SELECT DISTINCT "accountId", CURRENT_TIMESTAMP FROM "play_game_stats"
ON CONFLICT ("accountId") DO NOTHING;

UPDATE "play_profiles" SET "levelNotice" = true
WHERE "accountId" IN (SELECT DISTINCT "accountId" FROM "play_game_stats");
