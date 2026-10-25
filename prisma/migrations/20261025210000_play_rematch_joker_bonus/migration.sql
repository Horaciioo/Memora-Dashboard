-- AlterTable
ALTER TABLE "play_sessions" ADD COLUMN     "rematchOfId" TEXT;

-- AlterTable
ALTER TABLE "play_baccalaureat_rounds" ADD COLUMN     "bonus" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rerolledById" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "play_sessions_rematchOfId_key" ON "play_sessions"("rematchOfId");

-- AddForeignKey
ALTER TABLE "play_sessions" ADD CONSTRAINT "play_sessions_rematchOfId_fkey" FOREIGN KEY ("rematchOfId") REFERENCES "play_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

