-- Gesture stretches of finished lives are drawn again, the Twitch chat presences included, so moderation time stops at one slot
DELETE FROM "live_mod_stints" AS st
USING "lives" l
WHERE l."id" = st."liveId" AND l."status" = 'ENDED' AND st."fromActions" = true;

INSERT INTO "live_mod_stints" ("id", "liveId", "accountId", "startedAt", "stoppedAt", "fromActions")
WITH moments AS (
  SELECT a."liveId", a."actorAccountId" AS "accountId", a."occurredAt" AS "at"
  FROM "moderation_actions" a
  WHERE a."actorAccountId" IS NOT NULL AND a."status" = 'SUCCEEDED'
  UNION ALL
  SELECT c."liveId", c."accountId", c."seenAt" AS "at"
  FROM "live_chat_presences" c
),
slots AS (
  SELECT DISTINCT
    m."liveId",
    m."accountId",
    GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (m."at" - COALESCE(l."startedAt", l."plannedStartAt"))) / 900))::int AS slot
  FROM moments m
  JOIN "lives" l ON l."id" = m."liveId"
  WHERE l."status" = 'ENDED'
),
islands AS (
  SELECT *, slot - ROW_NUMBER() OVER (PARTITION BY "liveId", "accountId" ORDER BY slot) AS grp FROM slots
),
runs AS (
  SELECT "liveId", "accountId", MIN(slot) AS first_slot, MAX(slot) + 1 AS end_slot
  FROM islands GROUP BY "liveId", "accountId", grp
)
SELECT
  gen_random_uuid()::text,
  r."liveId",
  r."accountId",
  COALESCE(l."startedAt", l."plannedStartAt") + r.first_slot * INTERVAL '15 minutes',
  GREATEST(
    COALESCE(l."startedAt", l."plannedStartAt") + r.first_slot * INTERVAL '15 minutes',
    LEAST(COALESCE(l."startedAt", l."plannedStartAt") + r.end_slot * INTERVAL '15 minutes', COALESCE(l."endedAt", NOW()))
  ),
  true
FROM runs r
JOIN "lives" l ON l."id" = r."liveId";
