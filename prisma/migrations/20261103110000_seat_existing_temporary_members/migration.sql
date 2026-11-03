-- Observers already holding the function sit in the current recruitment session
INSERT INTO "recruitment_observers" ("id", "sessionId", "accountId")
SELECT gen_random_uuid()::text, current_session."id", holder."accountId"
FROM "account_functions" holder
JOIN "job_functions" fn ON fn."id" = holder."functionId" AND fn."name" = 'Observateurs'
CROSS JOIN LATERAL (
  SELECT "id" FROM "recruitment_sessions"
  WHERE "status" NOT IN ('CLOSED', 'ARCHIVED')
  ORDER BY "opensAt" DESC NULLS LAST, "createdAt" DESC
  LIMIT 1
) current_session
WHERE NOT EXISTS (SELECT 1 FROM "recruitment_observers" seat WHERE seat."accountId" = holder."accountId")
ON CONFLICT ("sessionId", "accountId") DO NOTHING;

-- Trainers already holding the function sit in the current promotion
INSERT INTO "academy_session_trainers" ("id", "sessionId", "accountId")
SELECT gen_random_uuid()::text, current_session."id", holder."accountId"
FROM "account_functions" holder
JOIN "job_functions" fn ON fn."id" = holder."functionId" AND fn."name" = 'Formateurs'
CROSS JOIN LATERAL (
  SELECT "id" FROM "academy_sessions"
  WHERE "status" NOT IN ('CLOSED', 'ARCHIVED')
  ORDER BY "startsAt" DESC
  LIMIT 1
) current_session
WHERE NOT EXISTS (SELECT 1 FROM "academy_session_trainers" seat WHERE seat."accountId" = holder."accountId")
ON CONFLICT ("sessionId", "accountId") DO NOTHING;
