-- Functions missing from databases seeded before they existed
INSERT INTO "job_functions" ("id", "name", "kind", "category", "icon", "summary", "accent", "position", "updatedAt")
VALUES
  ('fn_observers', 'Observateurs', 'SECONDARY', 'MODERATION', 'functionObserver', 'Assiste aux entretiens de recrutement.', '#8b7fd6', 12, CURRENT_TIMESTAMP),
  ('fn_coordinator', 'Coordinateur de Live', 'SECONDARY', 'MODERATION', 'coordinator', 'Peut être choisi pour coordonner un live.', '#d97706', 13, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- Every creator opens them, each with its team
INSERT INTO "youtuber_functions" ("id", "youtuberId", "functionId", "position", "createdAt")
SELECT 'yf-' || md5(y."id" || f."id"), y."id", f."id", f."position", NOW()
FROM "youtubers" y
CROSS JOIN "job_functions" f
WHERE f."name" IN ('Observateurs', 'Coordinateur de Live')
ON CONFLICT ("youtuberId", "functionId") DO NOTHING;

INSERT INTO "teams" ("id", "name", "youtuberId", "functionId", "archived", "createdAt", "updatedAt")
SELECT 'ft-' || md5(y."id" || f."id"), f."name", y."id", f."id", false, NOW(), NOW()
FROM "youtubers" y
CROSS JOIN "job_functions" f
WHERE f."name" IN ('Observateurs', 'Coordinateur de Live')
ON CONFLICT ("youtuberId", "functionId") DO NOTHING;
