-- The fixed functions keep the category and the kind the code gives them, whatever a database still holds
UPDATE "job_functions" SET "category" = 'MODERATION', "kind" = 'PRIMARY'
WHERE "name" IN ('Discord', 'Lives', 'Animateurs');
UPDATE "job_functions" SET "category" = 'MODERATION', "kind" = 'SECONDARY'
WHERE "name" IN ('Recruteurs', 'Formateurs', 'Observateurs');
UPDATE "job_functions" SET "category" = 'JUNIOR', "kind" = 'PRIMARY'
WHERE "name" IN ('Junior Discord', 'Junior Lives', 'Junior Animateurs');
UPDATE "job_functions" SET "category" = 'JUNIOR_RESPONSABLE', "kind" = 'PRIMARY'
WHERE "name" IN ('Junior Responsable Discord', 'Junior Responsable Lives', 'Junior Responsable Animateurs');

-- Every creator opens every function, and each function that makes a team has its team switched on
INSERT INTO "youtuber_functions" ("id", "youtuberId", "functionId", "position", "createdAt")
SELECT 'yf-' || md5(y."id" || f."id"), y."id", f."id", f."position", NOW()
FROM "youtubers" y
CROSS JOIN "job_functions" f
WHERE f."archived" = false
ON CONFLICT ("youtuberId", "functionId") DO NOTHING;

INSERT INTO "teams" ("id", "name", "youtuberId", "functionId", "archived", "createdAt", "updatedAt")
SELECT 'ft-' || md5(y."id" || f."id"), f."name", y."id", f."id", false, NOW(), NOW()
FROM "youtubers" y
CROSS JOIN "job_functions" f
WHERE f."category" = 'MODERATION' AND f."archived" = false
ON CONFLICT ("youtuberId", "functionId") DO UPDATE SET "archived" = false;

-- A hand made "Modération <function>" team and a team of a junior function fold into the team of the trade
CREATE TEMP TABLE "team_fold" AS
SELECT m."id" AS "manual_id", ft."id" AS "function_id"
FROM "teams" m
JOIN "job_functions" f ON f."category" = 'MODERATION' AND m."name" = 'Modération ' || f."name"
JOIN "teams" ft ON ft."youtuberId" = m."youtuberId" AND ft."functionId" = f."id"
WHERE m."functionId" IS NULL AND m."youtuberId" IS NOT NULL
UNION
SELECT jt."id", ft."id"
FROM "teams" jt
JOIN "job_functions" jf ON jf."id" = jt."functionId" AND jf."category" IN ('JUNIOR', 'JUNIOR_RESPONSABLE')
JOIN "job_functions" f
  ON f."name" = regexp_replace(regexp_replace(jf."name", '^Junior Responsable ', ''), '^Junior ', '')
JOIN "teams" ft ON ft."youtuberId" = jt."youtuberId" AND ft."functionId" = f."id"
WHERE jt."youtuberId" IS NOT NULL;

INSERT INTO "team_members" ("id", "teamId", "accountId", "createdAt")
SELECT 'fm-' || md5(tm."id"), t."function_id", tm."accountId", tm."createdAt"
FROM "team_members" tm
JOIN "team_fold" t ON t."manual_id" = tm."teamId"
ON CONFLICT ("teamId", "accountId") DO NOTHING;

INSERT INTO "team_leads" ("id", "teamId", "accountId", "createdAt")
SELECT 'fl-' || md5(tl."id"), t."function_id", tl."accountId", tl."createdAt"
FROM "team_leads" tl
JOIN "team_fold" t ON t."manual_id" = tl."teamId"
ON CONFLICT ("teamId", "accountId") DO NOTHING;

UPDATE "youtuber_leads" yl SET "teamId" = t."function_id"
FROM "team_fold" t WHERE yl."teamId" = t."manual_id";

UPDATE "calendar_events" e SET "audienceTeamId" = t."function_id"
FROM "team_fold" t WHERE e."audienceTeamId" = t."manual_id";

UPDATE "calendar_events" e SET "rollCallTeamIds" = ARRAY(
  SELECT DISTINCT COALESCE(t."function_id", x)
  FROM unnest(e."rollCallTeamIds") AS x
  LEFT JOIN "team_fold" t ON t."manual_id" = x
)
WHERE e."rollCallTeamIds" && ARRAY(SELECT "manual_id" FROM "team_fold");

DELETE FROM "teams" WHERE "id" IN (SELECT "manual_id" FROM "team_fold");

-- Whoever sits in the team of a function holds it, a moderator keeps the place they were given
INSERT INTO "account_functions" ("id", "accountId", "functionId", "createdAt")
SELECT 'af-' || md5(tm."id"), tm."accountId", t."functionId", NOW()
FROM "team_members" tm
JOIN "teams" t ON t."id" = tm."teamId"
JOIN "job_functions" tf ON tf."id" = t."functionId"
JOIN "accounts" a ON a."id" = tm."accountId"
WHERE t."functionId" IS NOT NULL
  AND a."role" = 'MODERATEUR'
  AND NOT EXISTS (
    SELECT 1 FROM "account_functions" af
    JOIN "job_functions" jf ON jf."id" = af."functionId"
    WHERE af."accountId" = tm."accountId"
      AND (jf."id" = tf."id" OR jf."name" IN ('Junior ' || tf."name", 'Junior Responsable ' || tf."name"))
  )
ON CONFLICT ("accountId", "functionId") DO NOTHING;

-- Each member sits in the team of every function they hold at their creators, a junior in the team of their trade
INSERT INTO "team_members" ("id", "teamId", "accountId", "createdAt")
SELECT DISTINCT 'ft-' || md5(a."id" || t."id"), t."id", a."id", NOW()
FROM "accounts" a
JOIN "_AccountToYoutuber" ay ON ay."A" = a."id"
JOIN "account_functions" af ON af."accountId" = a."id"
JOIN "job_functions" hf ON hf."id" = af."functionId"
JOIN "job_functions" tf
  ON tf."name" = regexp_replace(regexp_replace(hf."name", '^Junior Responsable ', ''), '^Junior ', '')
JOIN "teams" t ON t."youtuberId" = ay."B" AND t."functionId" = tf."id" AND t."archived" = false
WHERE a."role" IN ('MODERATEUR', 'JUNIOR')
  AND a."status" NOT IN ('LEFT', 'DISMISSED', 'RESIGNED')
ON CONFLICT ("teamId", "accountId") DO NOTHING;

DROP TABLE "team_fold";
