-- CreateTable
CREATE TABLE "recruitment_recruiters" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recruitment_recruiters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recruitment_recruiters_accountId_idx" ON "recruitment_recruiters"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_recruiters_sessionId_accountId_key" ON "recruitment_recruiters"("sessionId", "accountId");

-- AddForeignKey
ALTER TABLE "recruitment_recruiters" ADD CONSTRAINT "recruitment_recruiters_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "recruitment_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_recruiters" ADD CONSTRAINT "recruitment_recruiters_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Recruiters already leading interviews keep their seat
INSERT INTO "recruitment_recruiters" ("id", "sessionId", "accountId")
SELECT 'rr_' || md5("sessionId" || "recruiterId"), "sessionId", "recruiterId"
FROM "recruitment_candidates"
WHERE "recruiterId" IS NOT NULL
GROUP BY "sessionId", "recruiterId";
