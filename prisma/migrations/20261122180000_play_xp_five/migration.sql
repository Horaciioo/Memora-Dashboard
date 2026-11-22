-- Game XP goes from triple to five times the old value
UPDATE "play_game_stats"
SET "xp" = GREATEST(LEAST("xp"::bigint * 5 / 3, 2147483647), -2147483648)::integer;
