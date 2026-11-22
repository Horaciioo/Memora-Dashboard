-- Moderation time also reads the gestures of a member, Twitch and Memora alike
ALTER TABLE "live_mod_stints" ADD COLUMN "fromActions" BOOLEAN NOT NULL DEFAULT false;

-- A stretch left open on a finished live stops at the last beat of the member, never later than the end
UPDATE "live_mod_stints" AS st
SET "stoppedAt" = GREATEST(
  st."startedAt",
  LEAST(
    COALESCE(
      (SELECT MAX(p."lastBeatAt") FROM "modview_presences" p WHERE p."liveId" = st."liveId" AND p."accountId" = st."accountId"),
      l."endedAt"
    ),
    l."endedAt"
  )
)
FROM "lives" l
WHERE l."id" = st."liveId" AND st."stoppedAt" IS NULL AND l."endedAt" IS NOT NULL;

-- A stretch never runs past the end of its live
UPDATE "live_mod_stints" AS st
SET "stoppedAt" = GREATEST(st."startedAt", l."endedAt")
FROM "lives" l
WHERE l."id" = st."liveId" AND l."endedAt" IS NOT NULL AND st."stoppedAt" > l."endedAt";

-- Stretches drawn by the gestures since the start of Memora: a 15-minute slot per slot holding a gesture, neighbours joined
INSERT INTO "live_mod_stints" ("id", "liveId", "accountId", "startedAt", "stoppedAt", "fromActions")
WITH slots AS (
  SELECT DISTINCT
    a."liveId",
    a."actorAccountId" AS "accountId",
    GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (a."occurredAt" - COALESCE(l."startedAt", l."plannedStartAt"))) / 900))::int AS slot
  FROM "moderation_actions" a
  JOIN "lives" l ON l."id" = a."liveId"
  WHERE a."actorAccountId" IS NOT NULL AND a."status" = 'SUCCEEDED'
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
