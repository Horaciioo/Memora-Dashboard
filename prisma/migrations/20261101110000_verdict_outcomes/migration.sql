-- Verdict outcomes missing from databases seeded before they existed
INSERT INTO "recruitment_outcomes" ("id", "name", "accent", "position", "updatedAt")
VALUES
  ('verdict_favorable', 'Favorable', 'success', 3, CURRENT_TIMESTAMP),
  ('verdict_unfavorable', 'Défavorable', 'danger', 4, CURRENT_TIMESTAMP),
  ('verdict_mixed', 'Mitigé', 'caution', 5, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

UPDATE "recruitment_outcomes" SET "position" = 6 WHERE "name" = 'Accepté';
UPDATE "recruitment_outcomes" SET "position" = 7 WHERE "name" = 'Refusé';
UPDATE "recruitment_outcomes" SET "position" = 8 WHERE "name" = 'Désisté';
