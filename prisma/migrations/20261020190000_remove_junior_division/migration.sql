-- A junior has no division, the divisions run from one to three
UPDATE "accounts" SET "divisionId" = NULL
WHERE "divisionId" IN (SELECT "id" FROM "divisions" WHERE "name" = 'Junior');

DELETE FROM "divisions" WHERE "name" = 'Junior';
