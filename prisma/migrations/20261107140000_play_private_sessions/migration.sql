-- Private games open with a short code
CREATE TYPE "PlayVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

ALTER TABLE "play_sessions" ADD COLUMN "visibility" "PlayVisibility" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN "joinCode" TEXT;

CREATE UNIQUE INDEX "play_sessions_joinCode_key" ON "play_sessions"("joinCode");
