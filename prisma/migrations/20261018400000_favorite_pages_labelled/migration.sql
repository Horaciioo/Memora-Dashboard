-- Stars now carry the page name beside its path
ALTER TABLE "accounts" RENAME COLUMN "favoritePages" TO "favorites";
ALTER TABLE "accounts" ALTER COLUMN "favorites" DROP DEFAULT;
ALTER TABLE "accounts" ALTER COLUMN "favorites" TYPE JSONB USING '[]'::jsonb;
ALTER TABLE "accounts" ALTER COLUMN "favorites" SET DEFAULT '[]';
ALTER TABLE "accounts" ALTER COLUMN "favorites" SET NOT NULL;
