-- AlterTable
ALTER TABLE "pages" ADD COLUMN "categoryId" TEXT;

-- CreateTable
CREATE TABLE "page_categories" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_categories_ownerId_position_idx" ON "page_categories"("ownerId", "position");

-- CreateIndex
CREATE INDEX "pages_categoryId_position_idx" ON "pages"("categoryId", "position");

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "page_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_categories" ADD CONSTRAINT "page_categories_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
