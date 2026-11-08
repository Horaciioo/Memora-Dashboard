-- The Formateurs function is now called Référents
UPDATE "job_functions"
SET "name" = 'Référents',
    "summary" = REPLACE(REPLACE("summary", 'Formateur', 'Référent'), 'formateur', 'référent')
WHERE "name" = 'Formateurs'
  AND NOT EXISTS (SELECT 1 FROM "job_functions" WHERE "name" = 'Référents');
