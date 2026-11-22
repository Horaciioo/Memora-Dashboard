-- Only game XP is tripled, bonus and trophy XP go back to their value
UPDATE "play_profiles" SET "bonusXp" = "bonusXp" / 3;
UPDATE "play_trophy_wins" SET "xp" = "xp" / 3;
