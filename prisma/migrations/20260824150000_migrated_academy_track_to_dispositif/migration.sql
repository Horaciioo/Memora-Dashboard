-- Two canonical rows replacing the former enum values, named and described from pim-explain.md
INSERT INTO "dispositifs" ("id", "name", "summary", "accent", "position", "createdAt", "updatedAt")
VALUES
  ('dispositif-atria', 'ATRIA', 'Public qui découvre totalement sa fonction, parfois même le monde de l''influence. Objectif : apprendre, observer, vérifier que la fonction plaît.', 'info', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dispositif-pulse', 'PULSE', 'Public qui possède déjà les bases. Objectif : s''adapter aux méthodes Marsha et monter rapidement en compétence.', 'success', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable, nullable first so the backfill below can run
ALTER TABLE "academy_juniors" ADD COLUMN "dispositifId" TEXT;

-- Backfill every junior from their former track
UPDATE "academy_juniors" SET "dispositifId" = 'dispositif-atria' WHERE "track" = 'ENTREE';
UPDATE "academy_juniors" SET "dispositifId" = 'dispositif-pulse' WHERE "track" = 'ADAPTATION';

-- Every junior now has a dispositif, the column can be required
ALTER TABLE "academy_juniors" ALTER COLUMN "dispositifId" SET NOT NULL;

ALTER TABLE "academy_juniors" DROP COLUMN "track";

-- DropEnum
DROP TYPE "AcademyTrack";

-- AddForeignKey
ALTER TABLE "academy_juniors" ADD CONSTRAINT "academy_juniors_dispositifId_fkey" FOREIGN KEY ("dispositifId") REFERENCES "dispositifs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
