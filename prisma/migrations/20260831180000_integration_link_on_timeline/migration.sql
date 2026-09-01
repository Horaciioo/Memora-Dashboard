-- DropForeignKey
ALTER TABLE "integration_invites" DROP CONSTRAINT "integration_invites_dispositifId_fkey";
ALTER TABLE "integration_invites" DROP CONSTRAINT "integration_invites_recruitmentSessionId_fkey";

-- AlterTable
ALTER TABLE "integration_invites" DROP COLUMN "dispositifId";

-- Only one link is ever handed out per campaign, the extras go before the constraint lands
DELETE FROM "integration_invites" a
USING "integration_invites" b
WHERE a."recruitmentSessionId" IS NOT NULL
  AND a."recruitmentSessionId" = b."recruitmentSessionId"
  AND a."createdAt" < b."createdAt";

-- DropIndex
DROP INDEX "integration_invites_recruitmentSessionId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "integration_invites_recruitmentSessionId_key" ON "integration_invites"("recruitmentSessionId");

-- AddForeignKey
ALTER TABLE "integration_invites" ADD CONSTRAINT "integration_invites_recruitmentSessionId_fkey" FOREIGN KEY ("recruitmentSessionId") REFERENCES "recruitment_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "recruitment_steps" ADD COLUMN "emitsInvite" BOOLEAN NOT NULL DEFAULT false;

-- Every campaign already open closes on the step that hands out the integration form
INSERT INTO "recruitment_steps" ("id", "sessionId", "title", "notes", "owner", "offset", "required", "emitsInvite", "position", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  s."id",
  'Envoi du formulaire d''intégration',
  'À la fin de la réunion d''information collective, le formulaire part aux validés.',
  'RESPONSABLE',
  COALESCE((SELECT MAX(st."offset") FROM "recruitment_steps" st WHERE st."sessionId" = s."id"), 0),
  true,
  true,
  COALESCE((SELECT MAX(st."position") FROM "recruitment_steps" st WHERE st."sessionId" = s."id"), 0) + 1000,
  NOW(),
  NOW()
FROM "recruitment_sessions" s
WHERE NOT EXISTS (
  SELECT 1 FROM "recruitment_steps" st WHERE st."sessionId" = s."id" AND st."emitsInvite" = true
);
