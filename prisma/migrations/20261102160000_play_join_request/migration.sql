-- A player asking to join a game already running is written in its chat
ALTER TYPE "PlayMessageKind" ADD VALUE 'REQUESTED';
