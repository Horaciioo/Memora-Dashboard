-- Every creator has its observers team switched on
INSERT INTO "teams" ("id", "name", "youtuberId", "functionId", "archived", "createdAt", "updatedAt")
SELECT 'observers-' || y."id", f."name", y."id", f."id", false, NOW(), NOW()
FROM "youtubers" y
CROSS JOIN "job_functions" f
WHERE f."name" = 'Observateurs'
ON CONFLICT ("youtuberId", "functionId") DO UPDATE SET "archived" = false;
