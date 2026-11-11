-- Watch words the team shares on a channel
CREATE TABLE "mod_shared_words" (
    "id" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "termKey" TEXT NOT NULL,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mod_shared_words_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "mod_shared_words_youtuberId_termKey_key" ON "mod_shared_words"("youtuberId", "termKey");

ALTER TABLE "mod_shared_words" ADD CONSTRAINT "mod_shared_words_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mod_shared_words" ADD CONSTRAINT "mod_shared_words_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
