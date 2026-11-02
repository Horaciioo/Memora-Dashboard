-- Candidates still deliberating move to the mixed verdict, then the outcome goes
UPDATE "recruitment_candidates"
SET "outcomeId" = (SELECT "id" FROM "recruitment_outcomes" WHERE "name" = 'Mitigé')
WHERE "outcomeId" = (SELECT "id" FROM "recruitment_outcomes" WHERE "name" = 'En délibération')
  AND EXISTS (SELECT 1 FROM "recruitment_outcomes" WHERE "name" = 'Mitigé');

DELETE FROM "recruitment_outcomes" WHERE "name" = 'En délibération';
