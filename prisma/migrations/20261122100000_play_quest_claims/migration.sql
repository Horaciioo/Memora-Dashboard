-- Daily quest rewards, taken once per slot and day
CREATE TABLE "play_quest_claims" (
    "accountId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "xp" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_quest_claims_pkey" PRIMARY KEY ("accountId","day","slot")
);

-- AddForeignKey
ALTER TABLE "play_quest_claims" ADD CONSTRAINT "play_quest_claims_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
