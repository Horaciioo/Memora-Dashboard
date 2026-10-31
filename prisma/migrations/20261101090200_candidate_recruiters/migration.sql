-- CreateTable
CREATE TABLE "candidate_recruiters" (
    "candidateId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_recruiters_pkey" PRIMARY KEY ("candidateId","accountId")
);

-- CreateIndex
CREATE INDEX "candidate_recruiters_accountId_idx" ON "candidate_recruiters"("accountId");

-- AddForeignKey
ALTER TABLE "candidate_recruiters" ADD CONSTRAINT "candidate_recruiters_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "recruitment_candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_recruiters" ADD CONSTRAINT "candidate_recruiters_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Carry the single recruiter of each candidate over
INSERT INTO "candidate_recruiters" ("candidateId", "accountId", "createdAt")
SELECT "id", "recruiterId", "createdAt"
FROM "recruitment_candidates"
WHERE "recruiterId" IS NOT NULL;
