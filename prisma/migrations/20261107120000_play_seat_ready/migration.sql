-- Lobby seats confirm they are ready
ALTER TABLE "play_seats" ADD COLUMN "readyAt" TIMESTAMP(3);
