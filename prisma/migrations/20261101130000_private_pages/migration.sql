-- CreateEnum
CREATE TYPE "PageAccessLevel" AS ENUM ('FULL', 'EDIT', 'COMMENT', 'VIEW');

-- CreateEnum
CREATE TYPE "PageShareScope" AS ENUM ('WORKSPACE', 'ROLE', 'ACCOUNT');

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "parentId" TEXT,
    "title" TEXT NOT NULL DEFAULT '',
    "icon" TEXT,
    "coverMediaId" TEXT,
    "content" JSONB NOT NULL,
    "searchText" TEXT NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 1,
    "position" INTEGER NOT NULL DEFAULT 0,
    "inheritAccess" BOOLEAN NOT NULL DEFAULT true,
    "trashedAt" TIMESTAMP(3),
    "trashedById" TEXT,
    "trashRootId" TEXT,
    "editedById" TEXT,
    "contentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_grants" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "scope" "PageShareScope" NOT NULL,
    "accountId" TEXT,
    "role" "MemberRole",
    "level" "PageAccessLevel" NOT NULL,
    "targetKey" TEXT NOT NULL,
    "grantedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_media" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "storageEntryId" TEXT NOT NULL,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_revisions" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_comments" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "blockId" TEXT,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pages_ownerId_trashedAt_idx" ON "pages"("ownerId", "trashedAt");

-- CreateIndex
CREATE INDEX "pages_parentId_position_idx" ON "pages"("parentId", "position");

-- CreateIndex
CREATE INDEX "pages_trashRootId_idx" ON "pages"("trashRootId");

-- CreateIndex
CREATE INDEX "page_grants_accountId_idx" ON "page_grants"("accountId");

-- CreateIndex
CREATE INDEX "page_grants_scope_role_idx" ON "page_grants"("scope", "role");

-- CreateIndex
CREATE UNIQUE INDEX "page_grants_pageId_targetKey_key" ON "page_grants"("pageId", "targetKey");

-- CreateIndex
CREATE UNIQUE INDEX "page_media_storageEntryId_key" ON "page_media"("storageEntryId");

-- CreateIndex
CREATE INDEX "page_media_pageId_idx" ON "page_media"("pageId");

-- CreateIndex
CREATE INDEX "page_revisions_pageId_createdAt_idx" ON "page_revisions"("pageId", "createdAt");

-- CreateIndex
CREATE INDEX "page_comments_pageId_createdAt_idx" ON "page_comments"("pageId", "createdAt");

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_grants" ADD CONSTRAINT "page_grants_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_grants" ADD CONSTRAINT "page_grants_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_grants" ADD CONSTRAINT "page_grants_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_media" ADD CONSTRAINT "page_media_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_media" ADD CONSTRAINT "page_media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_revisions" ADD CONSTRAINT "page_revisions_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_revisions" ADD CONSTRAINT "page_revisions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_comments" ADD CONSTRAINT "page_comments_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_comments" ADD CONSTRAINT "page_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Search over titles and text, outside Prisma like the other trigram indexes
CREATE INDEX IF NOT EXISTS "pages_title_trgm"
  ON "pages" USING gin ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "pages_searchText_trgm"
  ON "pages" USING gin ("searchText" gin_trgm_ops);
