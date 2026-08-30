-- Global search runs ILIKE '%term%', which no B-tree can serve.
-- Trigram indexes make those scans index-backed instead of sequential.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "accounts_displayName_trgm"
  ON "accounts" USING gin ("displayName" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "projects_title_trgm"
  ON "projects" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "projects_description_trgm"
  ON "projects" USING gin ("description" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "tasks_title_trgm"
  ON "tasks" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "tasks_description_trgm"
  ON "tasks" USING gin ("description" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "meetings_title_trgm"
  ON "meetings" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "meetings_introduction_trgm"
  ON "meetings" USING gin ("introduction" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "teams_name_trgm"
  ON "teams" USING gin ("name" gin_trgm_ops);
