-- A zone is named as one, the entries filed under the old model follow when the new one already exists
UPDATE "event_templates" SET "name" = 'Zone de recrutement'
WHERE "name" = 'Période de recrutement'
  AND NOT EXISTS (SELECT 1 FROM "event_templates" WHERE "name" = 'Zone de recrutement');

UPDATE "calendar_events" SET "templateId" = (SELECT "id" FROM "event_templates" WHERE "name" = 'Zone de recrutement')
WHERE "templateId" = (SELECT "id" FROM "event_templates" WHERE "name" = 'Période de recrutement')
  AND EXISTS (SELECT 1 FROM "event_templates" WHERE "name" = 'Zone de recrutement');
