-- Divisions take roman numerals
UPDATE "divisions" SET "name" = 'Division I' WHERE "name" = 'Division 1';
UPDATE "divisions" SET "name" = 'Division II' WHERE "name" = 'Division 2';
UPDATE "divisions" SET "name" = 'Division III' WHERE "name" = 'Division 3';
UPDATE "divisions" SET "name" = 'Division IV' WHERE "name" = 'Division 4';

-- Every responsable sits in the last division
UPDATE "accounts" SET "divisionId" = (SELECT "id" FROM "divisions" WHERE "name" = 'Division IV')
WHERE "role" = 'RESPONSABLE' AND EXISTS (SELECT 1 FROM "divisions" WHERE "name" = 'Division IV');
