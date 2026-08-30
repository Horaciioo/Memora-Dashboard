-- CreateTable
CREATE TABLE "recruitment_responsables" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recruitment_responsables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recruitment_responsables_accountId_idx" ON "recruitment_responsables"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_responsables_sessionId_accountId_key" ON "recruitment_responsables"("sessionId", "accountId");

-- AddForeignKey
ALTER TABLE "recruitment_responsables" ADD CONSTRAINT "recruitment_responsables_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "recruitment_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_responsables" ADD CONSTRAINT "recruitment_responsables_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
