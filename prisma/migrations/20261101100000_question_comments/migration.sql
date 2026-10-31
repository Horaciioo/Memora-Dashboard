-- AlterTable
ALTER TABLE "recruitment_comments" ADD COLUMN "questionKey" TEXT,
ADD COLUMN "pinnedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "recruitment_comments_candidateId_questionKey_idx" ON "recruitment_comments"("candidateId", "questionKey");

-- Carry the notes over as comments, signed by the first recruiter of the candidate
INSERT INTO "recruitment_comments" ("id", "candidateId", "questionKey", "authorId", "body", "createdAt")
SELECT 'cm' || md5(a."id"), a."candidateId", a."questionKey",
       (SELECT cr."accountId" FROM "candidate_recruiters" cr WHERE cr."candidateId" = a."candidateId" ORDER BY cr."createdAt" LIMIT 1),
       a."notes", a."updatedAt"
FROM "recruitment_answers" a
WHERE a."notes" <> '';
