-- CreateTable
CREATE TABLE "mod_unban_rules" (
    "id" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "requireReason" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mod_unban_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mod_unban_rules_youtuberId_key" ON "mod_unban_rules"("youtuberId");

-- AddForeignKey
ALTER TABLE "mod_unban_rules" ADD CONSTRAINT "mod_unban_rules_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
