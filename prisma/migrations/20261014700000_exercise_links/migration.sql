-- Create table
CREATE TABLE "exercise_links" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "contextKey" TEXT NOT NULL,
    "claimToken" TEXT,
    "claimedAt" TIMESTAMP(3),
    "plays" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "expiredAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_links_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "exercise_links_token_key" ON "exercise_links"("token");
CREATE INDEX "exercise_links_candidateId_createdAt_idx" ON "exercise_links"("candidateId", "createdAt");

-- Foreign keys
ALTER TABLE "exercise_links" ADD CONSTRAINT "exercise_links_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "recruitment_candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exercise_links" ADD CONSTRAINT "exercise_links_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
