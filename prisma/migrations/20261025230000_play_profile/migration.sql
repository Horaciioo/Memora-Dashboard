-- CreateTable
CREATE TABLE "play_profiles" (
    "accountId" TEXT NOT NULL,
    "bonusXp" INTEGER NOT NULL DEFAULT 0,
    "bannedAt" TIMESTAMP(3),
    "banReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "play_profiles_pkey" PRIMARY KEY ("accountId")
);

-- AddForeignKey
ALTER TABLE "play_profiles" ADD CONSTRAINT "play_profiles_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
