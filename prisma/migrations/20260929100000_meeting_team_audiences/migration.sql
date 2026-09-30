-- Named seats only becomes a custom audience, the trade teams join the whole team
ALTER TYPE "MeetingAudience" RENAME VALUE 'INVITED' TO 'CUSTOM';
ALTER TYPE "MeetingAudience" ADD VALUE 'DISCORD';
ALTER TYPE "MeetingAudience" ADD VALUE 'TWITCH';
