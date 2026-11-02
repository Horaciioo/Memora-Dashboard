-- Replies hang under one root comment, gone with it
ALTER TABLE "page_comments" ADD COLUMN "parentId" TEXT;

ALTER TABLE "page_comments" ADD CONSTRAINT "page_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "page_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "page_comments_parentId_idx" ON "page_comments"("parentId");
