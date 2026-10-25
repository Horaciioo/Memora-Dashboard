-- Division IV no longer depends on the seed having run
INSERT INTO "divisions" ("id", "name", "rank", "summary", "leadAssignable", "updatedAt")
VALUES (gen_random_uuid()::text, 'Division IV', 4, 'Division des responsables.', false, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Every responsable sits in the last division
UPDATE "accounts" SET "divisionId" = (SELECT "id" FROM "divisions" WHERE "name" = 'Division IV')
WHERE "role" = 'RESPONSABLE';
