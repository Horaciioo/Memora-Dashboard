-- A model that only makes sense with a recruitment or an academy session
ALTER TABLE "event_templates" ADD COLUMN "linksTo" TEXT;
