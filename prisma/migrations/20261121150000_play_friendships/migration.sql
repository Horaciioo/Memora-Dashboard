-- Friendships between players, a request until accepted
CREATE TABLE "play_friendships" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "addresseeId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "play_friendships_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "play_friendships_addresseeId_idx" ON "play_friendships"("addresseeId");
CREATE UNIQUE INDEX "play_friendships_requesterId_addresseeId_key" ON "play_friendships"("requesterId", "addresseeId");

ALTER TABLE "play_friendships" ADD CONSTRAINT "play_friendships_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "play_friendships" ADD CONSTRAINT "play_friendships_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
