-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('ADMIN', 'RESPONSABLE', 'MODERATEUR');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACADEMY', 'ACTIVE', 'PAUSED', 'LEFT');

-- CreateEnum
CREATE TYPE "AcademyPeriod" AS ENUM ('DISCOVERY', 'PRACTICE');

-- CreateEnum
CREATE TYPE "WorkflowScope" AS ENUM ('PROJECT', 'TASK', 'MEETING');

-- CreateEnum
CREATE TYPE "AttendeeKind" AS ENUM ('LEAD', 'ASSISTANT', 'PARTICIPANT');

-- CreateEnum
CREATE TYPE "AbsenceStatus" AS ENUM ('PENDING', 'APPROVED', 'REFUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FunctionKind" AS ENUM ('PRIMARY', 'SECONDARY');

-- CreateEnum
CREATE TYPE "PermissionEffect" AS ENUM ('ALLOW', 'DENY');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "birthday" TIMESTAMP(3),
    "celebrateBirthday" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "timezone" TEXT,
    "avatarUrl" TEXT,
    "role" "MemberRole" NOT NULL DEFAULT 'MODERATEUR',
    "status" "MemberStatus" NOT NULL DEFAULT 'ACADEMY',
    "academyPeriod" "AcademyPeriod",
    "divisionId" TEXT,
    "youtuberId" TEXT,
    "primaryFunctionId" TEXT,
    "secondaryFunctionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_permissions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "effect" "PermissionEffect" NOT NULL DEFAULT 'ALLOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL,
    "permission" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "function_permissions" (
    "id" TEXT NOT NULL,
    "functionId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,

    CONSTRAINT "function_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youtubers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT,
    "accent" TEXT,
    "avatarUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "youtubers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "divisions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "glyph" TEXT,
    "imagePath" TEXT,
    "summary" TEXT,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_functions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "FunctionKind" NOT NULL DEFAULT 'PRIMARY',
    "summary" TEXT,
    "accent" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_functions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platforms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accent" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_states" (
    "id" TEXT NOT NULL,
    "scope" "WorkflowScope" NOT NULL,
    "name" TEXT NOT NULL,
    "accent" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isTerminal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "priorities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accent" TEXT,
    "weight" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "priorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "leadId" TEXT,
    "youtuberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "youtuberId" TEXT,
    "stateId" TEXT,
    "priorityId" TEXT,
    "platformId" TEXT,
    "leadId" TEXT,
    "deadline" TIMESTAMP(3),
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_assistants" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_assistants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communications" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "authorId" TEXT,
    "platformId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "publishedAt" TIMESTAMP(3),
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "ownerId" TEXT,
    "stateId" TEXT,
    "priorityId" TEXT,
    "youtuberId" TEXT,
    "projectId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "agenda" TEXT,
    "minutes" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER,
    "stateId" TEXT,
    "youtuberId" TEXT,
    "projectId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_attendees" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "kind" "AttendeeKind" NOT NULL DEFAULT 'PARTICIPANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absences" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "dayCount" INTEGER NOT NULL,
    "reason" TEXT,
    "status" "AbsenceStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "absences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_notes" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_links" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "networkId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_networks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accent" TEXT,
    "urlPrefix" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_networks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pims" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "authorId" TEXT,
    "heldAt" TIMESTAMP(3) NOT NULL,
    "sheet" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "period" "AcademyPeriod",
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "functionId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_records" (
    "id" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "validatorId" TEXT,
    "completedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livecon_levels" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "guidelines" TEXT,
    "accent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "livecon_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livecon_entries" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "youtuberId" TEXT,
    "actorId" TEXT,
    "reason" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "livecon_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "eventType" INTEGER NOT NULL,
    "origin" INTEGER NOT NULL DEFAULT 0,
    "actorId" TEXT,
    "subjectId" TEXT,
    "targetType" TEXT,
    "targetId" TEXT,
    "summary" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_entries" (
    "id" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storage_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_discordId_key" ON "accounts"("discordId");

-- CreateIndex
CREATE INDEX "accounts_role_idx" ON "accounts"("role");

-- CreateIndex
CREATE INDEX "accounts_status_idx" ON "accounts"("status");

-- CreateIndex
CREATE INDEX "accounts_divisionId_idx" ON "accounts"("divisionId");

-- CreateIndex
CREATE INDEX "accounts_youtuberId_idx" ON "accounts"("youtuberId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_accountId_idx" ON "sessions"("accountId");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "account_permissions_accountId_permission_key" ON "account_permissions"("accountId", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_permission_key" ON "role_permissions"("role", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "function_permissions_functionId_permission_key" ON "function_permissions"("functionId", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "youtubers_name_key" ON "youtubers"("name");

-- CreateIndex
CREATE INDEX "youtubers_archived_idx" ON "youtubers"("archived");

-- CreateIndex
CREATE UNIQUE INDEX "divisions_name_key" ON "divisions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "divisions_rank_key" ON "divisions"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "job_functions_name_key" ON "job_functions"("name");

-- CreateIndex
CREATE INDEX "job_functions_kind_idx" ON "job_functions"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "platforms_name_key" ON "platforms"("name");

-- CreateIndex
CREATE INDEX "workflow_states_scope_position_idx" ON "workflow_states"("scope", "position");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_states_scope_name_key" ON "workflow_states"("scope", "name");

-- CreateIndex
CREATE UNIQUE INDEX "priorities_name_key" ON "priorities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "priorities_weight_key" ON "priorities"("weight");

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- CreateIndex
CREATE INDEX "teams_leadId_idx" ON "teams"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_teamId_accountId_key" ON "team_members"("teamId", "accountId");

-- CreateIndex
CREATE INDEX "projects_stateId_position_idx" ON "projects"("stateId", "position");

-- CreateIndex
CREATE INDEX "projects_youtuberId_idx" ON "projects"("youtuberId");

-- CreateIndex
CREATE INDEX "projects_archived_idx" ON "projects"("archived");

-- CreateIndex
CREATE UNIQUE INDEX "project_assistants_projectId_accountId_key" ON "project_assistants"("projectId", "accountId");

-- CreateIndex
CREATE INDEX "communications_projectId_position_idx" ON "communications"("projectId", "position");

-- CreateIndex
CREATE INDEX "tasks_stateId_position_idx" ON "tasks"("stateId", "position");

-- CreateIndex
CREATE INDEX "tasks_ownerId_idx" ON "tasks"("ownerId");

-- CreateIndex
CREATE INDEX "tasks_projectId_idx" ON "tasks"("projectId");

-- CreateIndex
CREATE INDEX "meetings_scheduledAt_idx" ON "meetings"("scheduledAt");

-- CreateIndex
CREATE INDEX "meetings_stateId_position_idx" ON "meetings"("stateId", "position");

-- CreateIndex
CREATE INDEX "meeting_attendees_kind_idx" ON "meeting_attendees"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_attendees_meetingId_accountId_key" ON "meeting_attendees"("meetingId", "accountId");

-- CreateIndex
CREATE INDEX "absences_accountId_startDate_idx" ON "absences"("accountId", "startDate");

-- CreateIndex
CREATE INDEX "absences_status_idx" ON "absences"("status");

-- CreateIndex
CREATE INDEX "account_notes_accountId_createdAt_idx" ON "account_notes"("accountId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "social_links_accountId_networkId_key" ON "social_links"("accountId", "networkId");

-- CreateIndex
CREATE UNIQUE INDEX "social_networks_name_key" ON "social_networks"("name");

-- CreateIndex
CREATE INDEX "pims_accountId_heldAt_idx" ON "pims"("accountId", "heldAt");

-- CreateIndex
CREATE UNIQUE INDEX "trainings_name_key" ON "trainings"("name");

-- CreateIndex
CREATE INDEX "trainings_period_idx" ON "trainings"("period");

-- CreateIndex
CREATE UNIQUE INDEX "training_records_trainingId_accountId_key" ON "training_records"("trainingId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "livecon_levels_level_key" ON "livecon_levels"("level");

-- CreateIndex
CREATE INDEX "livecon_entries_youtuberId_startedAt_idx" ON "livecon_entries"("youtuberId", "startedAt");

-- CreateIndex
CREATE INDEX "livecon_entries_endedAt_idx" ON "livecon_entries"("endedAt");

-- CreateIndex
CREATE INDEX "activity_logs_subjectId_createdAt_idx" ON "activity_logs"("subjectId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_logs_targetType_targetId_idx" ON "activity_logs"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "activity_logs_eventType_idx" ON "activity_logs"("eventType");

-- CreateIndex
CREATE INDEX "storage_entries_bucket_idx" ON "storage_entries"("bucket");

-- CreateIndex
CREATE UNIQUE INDEX "storage_entries_bucket_key_key" ON "storage_entries"("bucket", "key");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_primaryFunctionId_fkey" FOREIGN KEY ("primaryFunctionId") REFERENCES "job_functions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_secondaryFunctionId_fkey" FOREIGN KEY ("secondaryFunctionId") REFERENCES "job_functions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_permissions" ADD CONSTRAINT "account_permissions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "function_permissions" ADD CONSTRAINT "function_permissions_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "workflow_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "priorities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assistants" ADD CONSTRAINT "project_assistants_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assistants" ADD CONSTRAINT "project_assistants_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communications" ADD CONSTRAINT "communications_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communications" ADD CONSTRAINT "communications_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communications" ADD CONSTRAINT "communications_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "workflow_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "priorities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "workflow_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absences" ADD CONSTRAINT "absences_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absences" ADD CONSTRAINT "absences_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_notes" ADD CONSTRAINT "account_notes_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_notes" ADD CONSTRAINT "account_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "social_networks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pims" ADD CONSTRAINT "pims_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pims" ADD CONSTRAINT "pims_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livecon_entries" ADD CONSTRAINT "livecon_entries_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "livecon_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livecon_entries" ADD CONSTRAINT "livecon_entries_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livecon_entries" ADD CONSTRAINT "livecon_entries_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
