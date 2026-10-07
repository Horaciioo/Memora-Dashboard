-- Trainers no longer read the live logs, only the responsables of the creator do
DELETE FROM "function_permissions"
WHERE "permission" = 'live:log:read'
  AND "functionId" IN (SELECT "id" FROM "job_functions" WHERE "name" = 'Formateurs');
