-- A meeting that only expects the team it concerns
ALTER TYPE "MeetingAudience" ADD VALUE IF NOT EXISTS 'TEAM';
