-- CreateTable
CREATE TABLE "recruitment_observers" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "quota" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recruitment_observers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recruitment_observers_accountId_idx" ON "recruitment_observers"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_observers_sessionId_accountId_key" ON "recruitment_observers"("sessionId", "accountId");

-- AddForeignKey
ALTER TABLE "recruitment_observers" ADD CONSTRAINT "recruitment_observers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "recruitment_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_observers" ADD CONSTRAINT "recruitment_observers_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
