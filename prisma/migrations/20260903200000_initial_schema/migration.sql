-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('ADMIN', 'RESPONSABLE', 'MODERATEUR');

-- CreateEnum
CREATE TYPE "AccessCategory" AS ENUM ('LEADER', 'ADMINISTRATION', 'RESPONSABILITE', 'MODERATION');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('PENDING', 'ACADEMY', 'ACTIVE', 'PAUSED', 'LEFT');

-- CreateEnum
CREATE TYPE "IntegrationLinkKind" AS ENUM ('ACCOUNT', 'PROFILE', 'ACADEMY');

-- CreateEnum
CREATE TYPE "ConstraintKind" AS ENUM ('MEDICAL', 'ILLNESS', 'PRIVATE');

-- CreateEnum
CREATE TYPE "AcademyPeriod" AS ENUM ('DISCOVERY', 'PRACTICE');

-- CreateEnum
CREATE TYPE "AcademySessionStatus" AS ENUM ('DRAFT', 'OPEN', 'RUNNING', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AcademyJuniorStatus" AS ENUM ('ACTIVE', 'VALIDATED', 'STOPPED');

-- CreateEnum
CREATE TYPE "AcademyStepKind" AS ENUM ('FORMATION', 'BILAN_VOCAL', 'ENTREVUE', 'POINT_RESPONSABLE', 'SESSION_TRAVAIL');

-- CreateEnum
CREATE TYPE "AcademyStage" AS ENUM ('PREPARATION', 'DISCOVERY', 'REVIEW_ONE', 'PRACTICE', 'REVIEW_FINAL', 'BONUS');

-- CreateEnum
CREATE TYPE "StepAnchor" AS ENUM ('DAY', 'LIVE');

-- CreateEnum
CREATE TYPE "StepOwner" AS ENUM ('RESPONSABLE', 'FORMATEURS', 'BOTH', 'JUNIOR');

-- CreateEnum
CREATE TYPE "NoteKind" AS ENUM ('POSITIVE', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "ObjectiveStatus" AS ENUM ('OPEN', 'REACHED', 'MISSED');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'DONE', 'ABANDONED');

-- CreateEnum
CREATE TYPE "ReviewAdvice" AS ENUM ('PASS', 'BONUS', 'STOP');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'VALIDATED', 'REJECTED');

-- CreateEnum
CREATE TYPE "WorkflowScope" AS ENUM ('PROJECT', 'TASK', 'MEETING');

-- CreateEnum
CREATE TYPE "WorkflowPhase" AS ENUM ('TODO', 'DOING', 'DONE');

-- CreateEnum
CREATE TYPE "AttendeeKind" AS ENUM ('LEAD', 'ASSISTANT', 'PARTICIPANT');

-- CreateEnum
CREATE TYPE "AbsenceStatus" AS ENUM ('PENDING', 'APPROVED', 'REFUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FunctionKind" AS ENUM ('PRIMARY', 'SECONDARY');

-- CreateEnum
CREATE TYPE "PermissionEffect" AS ENUM ('ALLOW', 'DENY');

-- CreateEnum
CREATE TYPE "CalendarKind" AS ENUM ('ZONE', 'PERIOD', 'EVENT');

-- CreateEnum
CREATE TYPE "EventVisibility" AS ENUM ('EVERYONE', 'RESPONSABLES', 'ADMINS');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PENDING', 'PRESENT', 'ABSENT');

-- CreateEnum
CREATE TYPE "TrainingBlockKind" AS ENUM ('TEXT', 'QUIZ');

-- CreateEnum
CREATE TYPE "SanctionKind" AS ENUM ('DELETE', 'WARN', 'TIMEOUT', 'BAN');

-- CreateEnum
CREATE TYPE "RecruitmentStatus" AS ENUM ('DRAFT', 'ANNOUNCED', 'INTERVIEWS', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RecruitmentOwner" AS ENUM ('RESPONSABLE', 'RECRUTEURS', 'BOTH');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "discordUsername" TEXT,
    "discordAvatarHash" TEXT,
    "discordSyncedAt" TIMESTAMP(3),
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "birthday" TIMESTAMP(3),
    "celebrateBirthday" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "historyConsentAt" TIMESTAMP(3),
    "historyConsentVersion" INTEGER,
    "anonymisedAt" TIMESTAMP(3),
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "timezone" TEXT,
    "theme" TEXT,
    "colorVision" TEXT,
    "fontScale" TEXT,
    "avatarUrl" TEXT,
    "role" "MemberRole" NOT NULL DEFAULT 'MODERATEUR',
    "status" "MemberStatus" NOT NULL DEFAULT 'ACADEMY',
    "divisionId" TEXT,
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
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "unsealedAt" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factor_credentials" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "lastStep" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "two_factor_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factor_recovery_codes" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "digest" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_recovery_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discord_tokens" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discord_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_permissions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "effect" "PermissionEffect" NOT NULL DEFAULT 'ALLOW',
    "youtuberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL,
    "permission" TEXT NOT NULL,
    "effect" "PermissionEffect" NOT NULL DEFAULT 'ALLOW',
    "youtuberId" TEXT,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grant_migrations" (
    "key" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grant_migrations_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "role_appearances" (
    "role" "MemberRole" NOT NULL,
    "accent" TEXT,
    "icon" TEXT,

    CONSTRAINT "role_appearances_pkey" PRIMARY KEY ("role")
);

-- CreateTable
CREATE TABLE "function_permissions" (
    "id" TEXT NOT NULL,
    "functionId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "effect" "PermissionEffect" NOT NULL DEFAULT 'ALLOW',
    "youtuberId" TEXT,

    CONSTRAINT "function_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youtubers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT,
    "accent" TEXT,
    "avatarUrl" TEXT,
    "bannerUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "youtubers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youtuber_functions" (
    "id" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "functionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "youtuber_functions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youtuber_leads" (
    "id" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "youtuber_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "divisions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "glyph" TEXT,
    "imagePath" TEXT,
    "summary" TEXT,
    "rank" INTEGER NOT NULL,
    "leadAssignable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_functions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "FunctionKind" NOT NULL DEFAULT 'PRIMARY',
    "category" "AccessCategory" NOT NULL DEFAULT 'MODERATION',
    "icon" TEXT,
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
    "avatarUrl" TEXT,
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
    "phase" "WorkflowPhase" NOT NULL DEFAULT 'TODO',
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
    "archived" BOOLEAN NOT NULL DEFAULT false,
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
    "emoji" TEXT,
    "description" TEXT,
    "youtuberId" TEXT,
    "stateId" TEXT,
    "priorityId" TEXT,
    "platformId" TEXT,
    "deadline" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_leads" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_leads_pkey" PRIMARY KEY ("id")
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
    "emoji" TEXT,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "ownerId" TEXT,
    "stateId" TEXT,
    "priorityId" TEXT,
    "youtuberId" TEXT,
    "projectId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
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
    "emoji" TEXT,
    "introduction" TEXT,
    "outro" TEXT,
    "minutes" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER,
    "stateId" TEXT,
    "youtuberId" TEXT,
    "projectId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_topics" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_topics_pkey" PRIMARY KEY ("id")
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
    "reasonCode" INTEGER,
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
    "networkId" TEXT,
    "label" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "url" TEXT,
    "accent" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_networks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "urlPrefix" TEXT NOT NULL,
    "accent" TEXT,
    "avatarUrl" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_networks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_constraints" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "kind" "ConstraintKind" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_constraints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispositifs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "accent" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispositifs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accent" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "functionId" TEXT,
    "dispositifId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pim_step_templates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "functionId" TEXT,
    "dispositifId" TEXT,
    "stage" "AcademyStage" NOT NULL,
    "anchor" "StepAnchor" NOT NULL,
    "offset" INTEGER NOT NULL,
    "owner" "StepOwner" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pim_step_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "period" "AcademyPeriod",
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "functionId" TEXT,
    "dispositifId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_chapters" (
    "id" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_blocks" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "kind" "TrainingBlockKind" NOT NULL,
    "body" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "multiple" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_choices" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quiz_choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "junior_answers" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "choiceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "correct" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "junior_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_records" (
    "id" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "validatorId" TEXT,
    "status" "TrainingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "abandonedAt" TIMESTAMP(3),
    "juniorId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_sessions" (
    "id" TEXT NOT NULL,
    "functionId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "status" "AcademySessionStatus" NOT NULL DEFAULT 'DRAFT',
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_invites" (
    "id" TEXT NOT NULL,
    "kind" "IntegrationLinkKind" NOT NULL DEFAULT 'ACCOUNT',
    "token" TEXT NOT NULL,
    "youtuberId" TEXT,
    "functionId" TEXT,
    "sessionId" TEXT,
    "recruitmentSessionId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxUses" INTEGER,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_claims" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "discordUsername" TEXT,
    "discordAvatarHash" TEXT,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "accountId" TEXT,

    CONSTRAINT "integration_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_session_trainers" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_session_trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_juniors" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "trainerId" TEXT,
    "dispositifId" TEXT NOT NULL,
    "status" "AcademyJuniorStatus" NOT NULL DEFAULT 'ACTIVE',
    "stage" "AcademyStage" NOT NULL DEFAULT 'PREPARATION',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedAt" TIMESTAMP(3),
    "liveCount" INTEGER NOT NULL DEFAULT 0,
    "bonusLives" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_juniors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "junior_skills" (
    "id" TEXT NOT NULL,
    "juniorId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "percent" INTEGER NOT NULL DEFAULT 0,
    "validatorId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "junior_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "junior_notes" (
    "id" TEXT NOT NULL,
    "juniorId" TEXT NOT NULL,
    "authorId" TEXT,
    "stage" "AcademyStage" NOT NULL,
    "kind" "NoteKind" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "junior_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "junior_objectives" (
    "id" TEXT NOT NULL,
    "juniorId" TEXT NOT NULL,
    "authorId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueAt" TIMESTAMP(3),
    "status" "ObjectiveStatus" NOT NULL DEFAULT 'OPEN',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "junior_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_steps" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "juniorId" TEXT,
    "authorId" TEXT,
    "templateId" TEXT,
    "kind" "AcademyStepKind",
    "title" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "doneAt" TIMESTAMP(3),
    "notes" TEXT,
    "stage" "AcademyStage",
    "anchor" "StepAnchor",
    "offset" INTEGER,
    "owner" "StepOwner",
    "required" BOOLEAN NOT NULL DEFAULT false,
    "validatedById" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_reviews" (
    "id" TEXT NOT NULL,
    "juniorId" TEXT NOT NULL,
    "authorId" TEXT,
    "stage" "AcademyStage" NOT NULL,
    "heldAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER,
    "feeling" TEXT,
    "summary" TEXT NOT NULL DEFAULT '',
    "advice" "ReviewAdvice" NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "CalendarKind" NOT NULL DEFAULT 'EVENT',
    "summary" TEXT,
    "body" TEXT,
    "accent" TEXT,
    "visibility" "EventVisibility" NOT NULL DEFAULT 'EVERYONE',
    "defaultMinutes" INTEGER,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "emoji" TEXT,
    "description" TEXT,
    "kind" "CalendarKind" NOT NULL DEFAULT 'EVENT',
    "templateId" TEXT,
    "accent" TEXT,
    "ownerId" TEXT,
    "accountId" TEXT,
    "youtuberId" TEXT,
    "projectId" TEXT,
    "meetingId" TEXT,
    "sessionId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "EventVisibility",
    "rollCall" BOOLEAN NOT NULL DEFAULT false,
    "rosterShared" BOOLEAN NOT NULL DEFAULT false,
    "rollCallTeamIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "remindAt" TIMESTAMP(3),
    "remindedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendances" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_attendances_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "actorId" TEXT,
    "kind" INTEGER NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "subject" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "sanction_measures" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "SanctionKind" NOT NULL DEFAULT 'TIMEOUT',
    "durationMinutes" INTEGER,
    "permanent" BOOLEAN NOT NULL DEFAULT false,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "accent" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sanction_measures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sanction_offenses" (
    "id" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "example" TEXT,
    "warningExample" TEXT,
    "accent" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sanction_offenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sanction_tiers" (
    "id" TEXT NOT NULL,
    "offenseId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "measureId" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "sanction_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_sessions" (
    "id" TEXT NOT NULL,
    "youtuberId" TEXT NOT NULL,
    "functionId" TEXT NOT NULL,
    "academySessionId" TEXT,
    "name" TEXT NOT NULL,
    "status" "RecruitmentStatus" NOT NULL DEFAULT 'DRAFT',
    "summary" TEXT,
    "instructions" TEXT NOT NULL DEFAULT '',
    "opensAt" TIMESTAMP(3),
    "closesAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_responsables" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recruitment_responsables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_candidates" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "formId" TEXT,
    "recruiterId" TEXT,
    "outcomeId" TEXT,
    "interviewAt" TIMESTAMP(3),
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "review" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_spectators" (
    "candidateId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "recruitment_spectators_pkey" PRIMARY KEY ("candidateId","accountId")
);

-- CreateTable
CREATE TABLE "recruitment_comments" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recruitment_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_outcomes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accent" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isTerminal" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_questions" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "hint" TEXT,
    "youtuberId" TEXT,
    "functionId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_step_templates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "youtuberId" TEXT,
    "functionId" TEXT,
    "offset" INTEGER NOT NULL DEFAULT 0,
    "owner" "RecruitmentOwner" NOT NULL DEFAULT 'RESPONSABLE',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_step_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_steps" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "templateId" TEXT,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "owner" "RecruitmentOwner" NOT NULL DEFAULT 'RESPONSABLE',
    "offset" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "doneAt" TIMESTAMP(3),
    "required" BOOLEAN NOT NULL DEFAULT false,
    "emitsInvite" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AccountToYoutuber" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AccountToYoutuber_AB_pkey" PRIMARY KEY ("A","B")
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
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_accountId_idx" ON "sessions"("accountId");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_credentials_accountId_key" ON "two_factor_credentials"("accountId");

-- CreateIndex
CREATE INDEX "two_factor_recovery_codes_credentialId_idx" ON "two_factor_recovery_codes"("credentialId");

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_recovery_codes_credentialId_digest_key" ON "two_factor_recovery_codes"("credentialId", "digest");

-- CreateIndex
CREATE UNIQUE INDEX "discord_tokens_accountId_key" ON "discord_tokens"("accountId");

-- CreateIndex
CREATE INDEX "discord_tokens_expiresAt_idx" ON "discord_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "account_permissions_accountId_youtuberId_idx" ON "account_permissions"("accountId", "youtuberId");

-- CreateIndex
CREATE INDEX "account_permissions_youtuberId_idx" ON "account_permissions"("youtuberId");

-- CreateIndex
CREATE INDEX "role_permissions_role_youtuberId_idx" ON "role_permissions"("role", "youtuberId");

-- CreateIndex
CREATE INDEX "role_permissions_youtuberId_idx" ON "role_permissions"("youtuberId");

-- CreateIndex
CREATE INDEX "function_permissions_functionId_youtuberId_idx" ON "function_permissions"("functionId", "youtuberId");

-- CreateIndex
CREATE INDEX "function_permissions_youtuberId_idx" ON "function_permissions"("youtuberId");

-- CreateIndex
CREATE UNIQUE INDEX "youtubers_name_key" ON "youtubers"("name");

-- CreateIndex
CREATE INDEX "youtubers_archived_idx" ON "youtubers"("archived");

-- CreateIndex
CREATE INDEX "youtuber_functions_functionId_idx" ON "youtuber_functions"("functionId");

-- CreateIndex
CREATE UNIQUE INDEX "youtuber_functions_youtuberId_functionId_key" ON "youtuber_functions"("youtuberId", "functionId");

-- CreateIndex
CREATE INDEX "youtuber_leads_accountId_idx" ON "youtuber_leads"("accountId");

-- CreateIndex
CREATE INDEX "youtuber_leads_teamId_idx" ON "youtuber_leads"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "youtuber_leads_youtuberId_accountId_key" ON "youtuber_leads"("youtuberId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "divisions_name_key" ON "divisions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "divisions_rank_key" ON "divisions"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "job_functions_name_key" ON "job_functions"("name");

-- CreateIndex
CREATE INDEX "job_functions_kind_idx" ON "job_functions"("kind");

-- CreateIndex
CREATE INDEX "job_functions_category_idx" ON "job_functions"("category");

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
CREATE INDEX "teams_leadId_idx" ON "teams"("leadId");

-- CreateIndex
CREATE INDEX "teams_youtuberId_archived_idx" ON "teams"("youtuberId", "archived");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_teamId_accountId_key" ON "team_members"("teamId", "accountId");

-- CreateIndex
CREATE INDEX "projects_stateId_position_idx" ON "projects"("stateId", "position");

-- CreateIndex
CREATE INDEX "projects_youtuberId_idx" ON "projects"("youtuberId");

-- CreateIndex
CREATE INDEX "projects_archived_idx" ON "projects"("archived");

-- CreateIndex
CREATE UNIQUE INDEX "project_leads_projectId_accountId_key" ON "project_leads"("projectId", "accountId");

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
CREATE INDEX "meeting_topics_meetingId_position_idx" ON "meeting_topics"("meetingId", "position");

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
CREATE INDEX "social_links_accountId_position_idx" ON "social_links"("accountId", "position");

-- CreateIndex
CREATE INDEX "social_links_networkId_idx" ON "social_links"("networkId");

-- CreateIndex
CREATE UNIQUE INDEX "social_links_accountId_label_key" ON "social_links"("accountId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "social_networks_name_key" ON "social_networks"("name");

-- CreateIndex
CREATE UNIQUE INDEX "account_constraints_accountId_kind_key" ON "account_constraints"("accountId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "dispositifs_name_key" ON "dispositifs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skill_categories_name_key" ON "skill_categories"("name");

-- CreateIndex
CREATE INDEX "skills_functionId_dispositifId_idx" ON "skills"("functionId", "dispositifId");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_functionId_dispositifId_key" ON "skills"("name", "functionId", "dispositifId");

-- CreateIndex
CREATE INDEX "pim_step_templates_functionId_dispositifId_idx" ON "pim_step_templates"("functionId", "dispositifId");

-- CreateIndex
CREATE UNIQUE INDEX "pim_step_templates_title_functionId_dispositifId_key" ON "pim_step_templates"("title", "functionId", "dispositifId");

-- CreateIndex
CREATE UNIQUE INDEX "trainings_name_key" ON "trainings"("name");

-- CreateIndex
CREATE INDEX "trainings_period_idx" ON "trainings"("period");

-- CreateIndex
CREATE INDEX "trainings_functionId_dispositifId_idx" ON "trainings"("functionId", "dispositifId");

-- CreateIndex
CREATE INDEX "training_chapters_trainingId_position_idx" ON "training_chapters"("trainingId", "position");

-- CreateIndex
CREATE INDEX "training_blocks_chapterId_position_idx" ON "training_blocks"("chapterId", "position");

-- CreateIndex
CREATE INDEX "quiz_questions_blockId_position_idx" ON "quiz_questions"("blockId", "position");

-- CreateIndex
CREATE INDEX "quiz_choices_questionId_position_idx" ON "quiz_choices"("questionId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "junior_answers_questionId_accountId_key" ON "junior_answers"("questionId", "accountId");

-- CreateIndex
CREATE INDEX "training_records_juniorId_idx" ON "training_records"("juniorId");

-- CreateIndex
CREATE UNIQUE INDEX "training_records_trainingId_accountId_key" ON "training_records"("trainingId", "accountId");

-- CreateIndex
CREATE INDEX "academy_sessions_functionId_startsAt_idx" ON "academy_sessions"("functionId", "startsAt");

-- CreateIndex
CREATE INDEX "academy_sessions_status_idx" ON "academy_sessions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "integration_invites_token_key" ON "integration_invites"("token");

-- CreateIndex
CREATE UNIQUE INDEX "integration_invites_recruitmentSessionId_key" ON "integration_invites"("recruitmentSessionId");

-- CreateIndex
CREATE INDEX "integration_invites_sessionId_idx" ON "integration_invites"("sessionId");

-- CreateIndex
CREATE INDEX "integration_invites_youtuberId_idx" ON "integration_invites"("youtuberId");

-- CreateIndex
CREATE INDEX "integration_claims_discordId_idx" ON "integration_claims"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "integration_claims_inviteId_discordId_key" ON "integration_claims"("inviteId", "discordId");

-- CreateIndex
CREATE UNIQUE INDEX "academy_session_trainers_sessionId_accountId_key" ON "academy_session_trainers"("sessionId", "accountId");

-- CreateIndex
CREATE INDEX "academy_juniors_status_idx" ON "academy_juniors"("status");

-- CreateIndex
CREATE UNIQUE INDEX "academy_juniors_sessionId_accountId_key" ON "academy_juniors"("sessionId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "junior_skills_juniorId_skillId_key" ON "junior_skills"("juniorId", "skillId");

-- CreateIndex
CREATE INDEX "junior_notes_juniorId_createdAt_idx" ON "junior_notes"("juniorId", "createdAt");

-- CreateIndex
CREATE INDEX "junior_objectives_juniorId_position_idx" ON "junior_objectives"("juniorId", "position");

-- CreateIndex
CREATE INDEX "academy_steps_sessionId_scheduledAt_idx" ON "academy_steps"("sessionId", "scheduledAt");

-- CreateIndex
CREATE INDEX "academy_steps_kind_idx" ON "academy_steps"("kind");

-- CreateIndex
CREATE INDEX "academy_steps_juniorId_stage_idx" ON "academy_steps"("juniorId", "stage");

-- CreateIndex
CREATE INDEX "academy_reviews_juniorId_heldAt_idx" ON "academy_reviews"("juniorId", "heldAt");

-- CreateIndex
CREATE UNIQUE INDEX "event_templates_name_key" ON "event_templates"("name");

-- CreateIndex
CREATE INDEX "event_templates_archived_idx" ON "event_templates"("archived");

-- CreateIndex
CREATE INDEX "event_templates_kind_idx" ON "event_templates"("kind");

-- CreateIndex
CREATE INDEX "calendar_events_startsAt_idx" ON "calendar_events"("startsAt");

-- CreateIndex
CREATE INDEX "calendar_events_kind_startsAt_idx" ON "calendar_events"("kind", "startsAt");

-- CreateIndex
CREATE INDEX "calendar_events_templateId_idx" ON "calendar_events"("templateId");

-- CreateIndex
CREATE INDEX "calendar_events_ownerId_idx" ON "calendar_events"("ownerId");

-- CreateIndex
CREATE INDEX "calendar_events_accountId_idx" ON "calendar_events"("accountId");

-- CreateIndex
CREATE INDEX "calendar_events_rollCall_remindAt_remindedAt_idx" ON "calendar_events"("rollCall", "remindAt", "remindedAt");

-- CreateIndex
CREATE INDEX "event_attendances_accountId_status_idx" ON "event_attendances"("accountId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendances_eventId_accountId_key" ON "event_attendances"("eventId", "accountId");

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
CREATE INDEX "notifications_recipientId_createdAt_idx" ON "notifications"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_recipientId_readAt_idx" ON "notifications"("recipientId", "readAt");

-- CreateIndex
CREATE INDEX "storage_entries_bucket_idx" ON "storage_entries"("bucket");

-- CreateIndex
CREATE UNIQUE INDEX "storage_entries_bucket_key_key" ON "storage_entries"("bucket", "key");

-- CreateIndex
CREATE UNIQUE INDEX "sanction_measures_name_key" ON "sanction_measures"("name");

-- CreateIndex
CREATE INDEX "sanction_measures_weight_idx" ON "sanction_measures"("weight");

-- CreateIndex
CREATE INDEX "sanction_offenses_youtuberId_position_idx" ON "sanction_offenses"("youtuberId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "sanction_offenses_youtuberId_name_key" ON "sanction_offenses"("youtuberId", "name");

-- CreateIndex
CREATE INDEX "sanction_tiers_levelId_idx" ON "sanction_tiers"("levelId");

-- CreateIndex
CREATE UNIQUE INDEX "sanction_tiers_offenseId_levelId_step_key" ON "sanction_tiers"("offenseId", "levelId", "step");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_sessions_academySessionId_key" ON "recruitment_sessions"("academySessionId");

-- CreateIndex
CREATE INDEX "recruitment_sessions_youtuberId_status_idx" ON "recruitment_sessions"("youtuberId", "status");

-- CreateIndex
CREATE INDEX "recruitment_sessions_functionId_idx" ON "recruitment_sessions"("functionId");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_sessions_youtuberId_functionId_name_key" ON "recruitment_sessions"("youtuberId", "functionId", "name");

-- CreateIndex
CREATE INDEX "recruitment_responsables_accountId_idx" ON "recruitment_responsables"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_responsables_sessionId_accountId_key" ON "recruitment_responsables"("sessionId", "accountId");

-- CreateIndex
CREATE INDEX "recruitment_candidates_discordId_idx" ON "recruitment_candidates"("discordId");

-- CreateIndex
CREATE INDEX "recruitment_candidates_outcomeId_position_idx" ON "recruitment_candidates"("outcomeId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_candidates_sessionId_discordId_key" ON "recruitment_candidates"("sessionId", "discordId");

-- CreateIndex
CREATE INDEX "recruitment_spectators_accountId_idx" ON "recruitment_spectators"("accountId");

-- CreateIndex
CREATE INDEX "recruitment_comments_candidateId_createdAt_idx" ON "recruitment_comments"("candidateId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_outcomes_name_key" ON "recruitment_outcomes"("name");

-- CreateIndex
CREATE INDEX "recruitment_outcomes_position_idx" ON "recruitment_outcomes"("position");

-- CreateIndex
CREATE INDEX "recruitment_questions_position_idx" ON "recruitment_questions"("position");

-- CreateIndex
CREATE INDEX "recruitment_questions_youtuberId_functionId_idx" ON "recruitment_questions"("youtuberId", "functionId");

-- CreateIndex
CREATE INDEX "recruitment_step_templates_position_idx" ON "recruitment_step_templates"("position");

-- CreateIndex
CREATE INDEX "recruitment_step_templates_youtuberId_functionId_idx" ON "recruitment_step_templates"("youtuberId", "functionId");

-- CreateIndex
CREATE INDEX "recruitment_steps_sessionId_position_idx" ON "recruitment_steps"("sessionId", "position");

-- CreateIndex
CREATE INDEX "_AccountToYoutuber_B_index" ON "_AccountToYoutuber"("B");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_primaryFunctionId_fkey" FOREIGN KEY ("primaryFunctionId") REFERENCES "job_functions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_secondaryFunctionId_fkey" FOREIGN KEY ("secondaryFunctionId") REFERENCES "job_functions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factor_credentials" ADD CONSTRAINT "two_factor_credentials_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factor_recovery_codes" ADD CONSTRAINT "two_factor_recovery_codes_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "two_factor_credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discord_tokens" ADD CONSTRAINT "discord_tokens_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_permissions" ADD CONSTRAINT "account_permissions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_permissions" ADD CONSTRAINT "account_permissions_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "function_permissions" ADD CONSTRAINT "function_permissions_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "function_permissions" ADD CONSTRAINT "function_permissions_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youtuber_functions" ADD CONSTRAINT "youtuber_functions_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youtuber_functions" ADD CONSTRAINT "youtuber_functions_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youtuber_leads" ADD CONSTRAINT "youtuber_leads_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youtuber_leads" ADD CONSTRAINT "youtuber_leads_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youtuber_leads" ADD CONSTRAINT "youtuber_leads_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "workflow_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "priorities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_leads" ADD CONSTRAINT "project_leads_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_leads" ADD CONSTRAINT "project_leads_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "workflow_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_topics" ADD CONSTRAINT "meeting_topics_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "social_networks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_constraints" ADD CONSTRAINT "account_constraints_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "skill_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_dispositifId_fkey" FOREIGN KEY ("dispositifId") REFERENCES "dispositifs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pim_step_templates" ADD CONSTRAINT "pim_step_templates_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pim_step_templates" ADD CONSTRAINT "pim_step_templates_dispositifId_fkey" FOREIGN KEY ("dispositifId") REFERENCES "dispositifs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_dispositifId_fkey" FOREIGN KEY ("dispositifId") REFERENCES "dispositifs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_chapters" ADD CONSTRAINT "training_chapters_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_blocks" ADD CONSTRAINT "training_blocks_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "training_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "training_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_choices" ADD CONSTRAINT "quiz_choices_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_answers" ADD CONSTRAINT "junior_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_answers" ADD CONSTRAINT "junior_answers_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_juniorId_fkey" FOREIGN KEY ("juniorId") REFERENCES "academy_juniors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_sessions" ADD CONSTRAINT "academy_sessions_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_invites" ADD CONSTRAINT "integration_invites_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_invites" ADD CONSTRAINT "integration_invites_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_invites" ADD CONSTRAINT "integration_invites_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "academy_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_invites" ADD CONSTRAINT "integration_invites_recruitmentSessionId_fkey" FOREIGN KEY ("recruitmentSessionId") REFERENCES "recruitment_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_invites" ADD CONSTRAINT "integration_invites_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_claims" ADD CONSTRAINT "integration_claims_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "integration_invites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_claims" ADD CONSTRAINT "integration_claims_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_session_trainers" ADD CONSTRAINT "academy_session_trainers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "academy_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_session_trainers" ADD CONSTRAINT "academy_session_trainers_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_juniors" ADD CONSTRAINT "academy_juniors_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "academy_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_juniors" ADD CONSTRAINT "academy_juniors_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_juniors" ADD CONSTRAINT "academy_juniors_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_juniors" ADD CONSTRAINT "academy_juniors_dispositifId_fkey" FOREIGN KEY ("dispositifId") REFERENCES "dispositifs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_skills" ADD CONSTRAINT "junior_skills_juniorId_fkey" FOREIGN KEY ("juniorId") REFERENCES "academy_juniors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_skills" ADD CONSTRAINT "junior_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_skills" ADD CONSTRAINT "junior_skills_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_notes" ADD CONSTRAINT "junior_notes_juniorId_fkey" FOREIGN KEY ("juniorId") REFERENCES "academy_juniors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_notes" ADD CONSTRAINT "junior_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_objectives" ADD CONSTRAINT "junior_objectives_juniorId_fkey" FOREIGN KEY ("juniorId") REFERENCES "academy_juniors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "junior_objectives" ADD CONSTRAINT "junior_objectives_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_steps" ADD CONSTRAINT "academy_steps_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "academy_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_steps" ADD CONSTRAINT "academy_steps_juniorId_fkey" FOREIGN KEY ("juniorId") REFERENCES "academy_juniors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_steps" ADD CONSTRAINT "academy_steps_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_steps" ADD CONSTRAINT "academy_steps_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "pim_step_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_steps" ADD CONSTRAINT "academy_steps_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_reviews" ADD CONSTRAINT "academy_reviews_juniorId_fkey" FOREIGN KEY ("juniorId") REFERENCES "academy_juniors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_reviews" ADD CONSTRAINT "academy_reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_reviews" ADD CONSTRAINT "academy_reviews_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "event_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "academy_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendances" ADD CONSTRAINT "event_attendances_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "calendar_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendances" ADD CONSTRAINT "event_attendances_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanction_offenses" ADD CONSTRAINT "sanction_offenses_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanction_tiers" ADD CONSTRAINT "sanction_tiers_offenseId_fkey" FOREIGN KEY ("offenseId") REFERENCES "sanction_offenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanction_tiers" ADD CONSTRAINT "sanction_tiers_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "livecon_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanction_tiers" ADD CONSTRAINT "sanction_tiers_measureId_fkey" FOREIGN KEY ("measureId") REFERENCES "sanction_measures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_sessions" ADD CONSTRAINT "recruitment_sessions_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_sessions" ADD CONSTRAINT "recruitment_sessions_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_sessions" ADD CONSTRAINT "recruitment_sessions_academySessionId_fkey" FOREIGN KEY ("academySessionId") REFERENCES "academy_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_responsables" ADD CONSTRAINT "recruitment_responsables_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "recruitment_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_responsables" ADD CONSTRAINT "recruitment_responsables_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_candidates" ADD CONSTRAINT "recruitment_candidates_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "recruitment_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_candidates" ADD CONSTRAINT "recruitment_candidates_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_candidates" ADD CONSTRAINT "recruitment_candidates_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "recruitment_outcomes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_spectators" ADD CONSTRAINT "recruitment_spectators_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "recruitment_candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_spectators" ADD CONSTRAINT "recruitment_spectators_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_comments" ADD CONSTRAINT "recruitment_comments_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "recruitment_candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_comments" ADD CONSTRAINT "recruitment_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_questions" ADD CONSTRAINT "recruitment_questions_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_questions" ADD CONSTRAINT "recruitment_questions_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_step_templates" ADD CONSTRAINT "recruitment_step_templates_youtuberId_fkey" FOREIGN KEY ("youtuberId") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_step_templates" ADD CONSTRAINT "recruitment_step_templates_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "job_functions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_steps" ADD CONSTRAINT "recruitment_steps_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "recruitment_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_steps" ADD CONSTRAINT "recruitment_steps_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "recruitment_step_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToYoutuber" ADD CONSTRAINT "_AccountToYoutuber_A_fkey" FOREIGN KEY ("A") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToYoutuber" ADD CONSTRAINT "_AccountToYoutuber_B_fkey" FOREIGN KEY ("B") REFERENCES "youtubers"("id") ON DELETE CASCADE ON UPDATE CASCADE;


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
