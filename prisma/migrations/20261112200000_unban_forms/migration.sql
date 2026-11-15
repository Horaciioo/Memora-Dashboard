-- CreateTable
CREATE TABLE "unban_form_versions" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "fields" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "publishedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unban_form_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unban_form_versions_number_key" ON "unban_form_versions"("number");

-- One draft at most, Prisma cannot declare a partial index
CREATE UNIQUE INDEX "unban_form_versions_single_draft" ON "unban_form_versions"(("publishedAt" IS NULL)) WHERE "publishedAt" IS NULL;

-- AddForeignKey
ALTER TABLE "unban_form_versions" ADD CONSTRAINT "unban_form_versions_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
