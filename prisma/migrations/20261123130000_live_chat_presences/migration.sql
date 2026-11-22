-- CreateTable
CREATE TABLE "live_chat_presences" (
    "id" TEXT NOT NULL,
    "liveId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_chat_presences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "live_chat_presences_liveId_accountId_seenAt_idx" ON "live_chat_presences"("liveId", "accountId", "seenAt");

-- AddForeignKey
ALTER TABLE "live_chat_presences" ADD CONSTRAINT "live_chat_presences_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "lives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_chat_presences" ADD CONSTRAINT "live_chat_presences_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
