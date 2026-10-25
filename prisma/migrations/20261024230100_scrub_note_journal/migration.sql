-- Private note bodies never stay in the journal (eventType 7 = NoteAdded)
UPDATE "activity_logs" SET "summary" = 'Note privée ajoutée' WHERE "eventType" = 7;
