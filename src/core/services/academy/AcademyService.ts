import 'server-only'

import crypto from 'crypto'

import { decryptField, encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { WEEK_GRID_DAYS, addDays } from '@/utils/format/days'
import { activeFunctions } from '@/core/services/reference/lookups'
import { conflict, notFound } from '@/core/lib/errors'
import { rowsToOptions, toOptions } from '@/core/lib/forms/options'
import { readDate, readList, readNumberValue, readText } from '@/core/lib/forms/values'
import { resolveStepState } from '@/core/services/academy/timeline'
import { memberOptions, toPerson } from '@/core/services/work/shared'
import { ACADEMY_FIELD_COPY } from '@/declarations/academy/copy'
import {
  ACADEMY_STAGE_REGISTRY,
  ACADEMY_STEP_KIND_REGISTRY,
  ACADEMY_JUNIOR_STATUS_REGISTRY,
  ACADEMY_SESSION_STATUS_REGISTRY,
  NOTE_KIND_REGISTRY,
  OBJECTIVE_STATUS_REGISTRY,
  REVIEW_ADVICE_REGISTRY,
} from '@/declarations/academy/registries'
import { ACADEMY_SETTINGS, FORM_SETTINGS } from '@/declarations/configurations/settings'
import type {
  AcademyStepView,
  AcademyReviewView,
  JuniorNoteView,
  JuniorObjectiveView,
  JuniorSkillView,
  JuniorTraining,
  JuniorView,
  MyTrainingAction,
  MyTrainingView,
  SessionDetail,
  SessionSummary,
} from '@/types/academy'
import type { FieldDefinition, FieldOption, FormValues } from '@/types/forms'
import {
  AcademyJuniorStatuses,
  AcademySessionStatuses,
  AcademyStages,
  MemberStatuses,
  NoteKinds,
  ObjectiveStatuses,
  ReviewAdvices,
  ReviewStatuses,
  StepAnchors,
  AcademyStepKinds,
  TrainingStatuses,
} from '@/utils/constants/hierarchy'
import type {
  AcademyStageName,
  AcademyStepKindName,
  AcademyJuniorStatusName,
  AcademySessionStatusName,
  NoteKindName,
  ObjectiveStatusName,
  ReviewAdviceName,
  ReviewStatusName,
  StepAnchorName,
  StepOwnerName,
  TrainingStatusName,
} from '@/utils/constants/hierarchy'
import { IntegrationLinkKinds } from '@/utils/constants/integration'
import type { Prisma } from '@prisma/client'

// Stages an actual voice check-in is written for, the others are timeline-driven
const REVIEW_STAGES = [
  AcademyStages.ReviewOne,
  AcademyStages.ReviewFinal,
  AcademyStages.Bonus,
] as const

const REVIEW_STAGE_OPTIONS: FieldOption[] = REVIEW_STAGES.map((stage) => ({
  value: stage,
  label: ACADEMY_STAGE_REGISTRY.label(stage),
}))

/**
 * Build the session form declarations
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const sessionFields = async (): Promise<FieldDefinition[]> => {
  const [members, functions] = await Promise.all([memberOptions(), activeFunctions()])

  return [
    {
      name: 'functionId',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.function,
      required: true,
      options: rowsToOptions(functions),
      mark: 'dot',
      span: 'half',
    },
    {
      name: 'status',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.status,
      required: true,
      options: toOptions(ACADEMY_SESSION_STATUS_REGISTRY),
      mark: 'dot',
      span: 'half',
    },
    {
      name: 'startsAt',
      kind: 'date',
      label: ACADEMY_FIELD_COPY.startsAt,
      required: true,
      span: 'half',
    },
    {
      name: 'endsAt',
      kind: 'date',
      label: ACADEMY_FIELD_COPY.endsAt,
      hint: ACADEMY_FIELD_COPY.endsAtHint,
      span: 'half',
    },
    {
      name: 'trainerIds',
      kind: 'multiselect',
      label: ACADEMY_FIELD_COPY.trainers,
      options: members,
    },
    {
      name: 'summary',
      kind: 'textarea',
      label: ACADEMY_FIELD_COPY.summary,
      maxLength: FORM_SETTINGS.longTextMaxLength,
    },
  ]
}

/**
 * Build the junior form declarations
 * @param {string} sessionId - Session identifier
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const juniorFields = async (sessionId: string): Promise<FieldDefinition[]> => {
  const [candidates, trainers, dispositifs] = await Promise.all([
    juniorCandidates(sessionId),
    memberOptions(),
    prisma.dispositif.findMany({ orderBy: { position: 'asc' } }),
  ])

  return [
    {
      name: 'accountId',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.account,
      required: true,
      options: candidates,
    },
    {
      name: 'trainerId',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.trainer,
      options: trainers,
      span: 'half',
    },
    {
      name: 'dispositifId',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.dispositif,
      required: true,
      options: rowsToOptions(dispositifs),
      span: 'half',
    },
    {
      name: 'status',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.juniorStatus,
      required: true,
      options: toOptions(ACADEMY_JUNIOR_STATUS_REGISTRY),
      mark: 'dot',
      span: 'half',
    },
    {
      name: 'liveCount',
      kind: 'number',
      label: ACADEMY_FIELD_COPY.liveCount,
      min: 0,
      max: ACADEMY_SETTINGS.maxLives,
      span: 'half',
    },
    {
      name: 'bonusLives',
      kind: 'number',
      label: ACADEMY_FIELD_COPY.bonusLives,
      hint: ACADEMY_FIELD_COPY.bonusLivesHint,
      min: 0,
      max: ACADEMY_SETTINGS.bonusMaxLives,
      span: 'half',
    },
    {
      name: 'summary',
      kind: 'textarea',
      label: ACADEMY_FIELD_COPY.juniorSummary,
      maxLength: FORM_SETTINGS.longTextMaxLength,
    },
  ]
}

/**
 * Build the session thread form declarations
 * @param {string} sessionId - Session identifier
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const stepFields = async (sessionId: string): Promise<FieldDefinition[]> => {
  const juniors = await prisma.academyJunior.findMany({
    where: { sessionId },
    include: { account: true },
    orderBy: { account: { displayName: 'asc' } },
  })

  return [
    {
      name: 'kind',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.kind,
      required: true,
      options: toOptions(ACADEMY_STEP_KIND_REGISTRY),
      mark: 'dot',
      span: 'half',
    },
    {
      name: 'scheduledAt',
      kind: 'datetime',
      label: ACADEMY_FIELD_COPY.scheduledAt,
      required: true,
      span: 'half',
    },
    {
      name: 'title',
      kind: 'text',
      label: ACADEMY_FIELD_COPY.title,
      required: true,
      maxLength: FORM_SETTINGS.titleMaxLength,
    },
    {
      name: 'juniorId',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.junior,
      options: juniors.map((junior) => ({ value: junior.id, label: junior.account.displayName })),
    },
    {
      name: 'notes',
      kind: 'textarea',
      label: ACADEMY_FIELD_COPY.notes,
      maxLength: FORM_SETTINGS.noteMaxLength,
    },
  ]
}

/**
 * Declarations of the voice check-in form
 * @type {FieldDefinition[]}
 */

export const REVIEW_FIELDS: FieldDefinition[] = [
  {
    name: 'stage',
    kind: 'select',
    label: ACADEMY_FIELD_COPY.reviewStage,
    required: true,
    options: REVIEW_STAGE_OPTIONS,
    mark: 'dot',
    span: 'half',
  },
  {
    name: 'heldAt',
    kind: 'date',
    label: ACADEMY_FIELD_COPY.heldAt,
    required: true,
    span: 'half',
  },
  {
    name: 'durationMinutes',
    kind: 'number',
    label: ACADEMY_FIELD_COPY.durationMinutes,
    required: true,
    min: FORM_SETTINGS.meetingMinDuration,
    max: FORM_SETTINGS.meetingMaxDuration,
    span: 'half',
  },
  {
    name: 'advice',
    kind: 'select',
    label: ACADEMY_FIELD_COPY.advice,
    required: true,
    options: toOptions(REVIEW_ADVICE_REGISTRY),
    mark: 'dot',
    span: 'half',
  },
  {
    name: 'feeling',
    kind: 'textarea',
    label: ACADEMY_FIELD_COPY.feeling,
    maxLength: FORM_SETTINGS.noteMaxLength,
  },
  {
    name: 'summary',
    kind: 'markdown',
    label: ACADEMY_FIELD_COPY.reviewSummary,
    required: true,
    maxLength: FORM_SETTINGS.markdownMaxLength,
  },
]

/**
 * Declarations of the decision form
 * @type {FieldDefinition[]}
 */

export const REVIEW_DECISION_FIELDS: FieldDefinition[] = [
  {
    name: 'decisionNote',
    kind: 'textarea',
    label: ACADEMY_FIELD_COPY.decisionNote,
    maxLength: FORM_SETTINGS.noteMaxLength,
  },
]

/**
 * Declarations of the FSI note form
 * @type {FieldDefinition[]}
 */

export const NOTE_FIELDS: FieldDefinition[] = [
  {
    name: 'stage',
    kind: 'select',
    label: ACADEMY_FIELD_COPY.noteStage,
    required: true,
    options: toOptions(ACADEMY_STAGE_REGISTRY),
    mark: 'dot',
    span: 'half',
  },
  {
    name: 'kind',
    kind: 'select',
    label: ACADEMY_FIELD_COPY.noteKind,
    required: true,
    options: toOptions(NOTE_KIND_REGISTRY),
    mark: 'dot',
    span: 'half',
  },
  {
    name: 'body',
    kind: 'textarea',
    label: ACADEMY_FIELD_COPY.noteBody,
    required: true,
    maxLength: FORM_SETTINGS.noteMaxLength,
  },
]

/**
 * Declarations of the personal objective form
 * @type {FieldDefinition[]}
 */

export const OBJECTIVE_FIELDS: FieldDefinition[] = [
  {
    name: 'title',
    kind: 'text',
    label: ACADEMY_FIELD_COPY.objectiveTitle,
    required: true,
    maxLength: FORM_SETTINGS.titleMaxLength,
  },
  {
    name: 'dueAt',
    kind: 'date',
    label: ACADEMY_FIELD_COPY.objectiveDueAt,
    span: 'half',
  },
  {
    name: 'status',
    kind: 'select',
    label: ACADEMY_FIELD_COPY.objectiveStatus,
    required: true,
    options: toOptions(OBJECTIVE_STATUS_REGISTRY),
    mark: 'dot',
    span: 'half',
  },
  {
    name: 'description',
    kind: 'textarea',
    label: ACADEMY_FIELD_COPY.objectiveDescription,
    maxLength: FORM_SETTINGS.longTextMaxLength,
  },
]

/**
 * Read the moderators a session may still take in
 * @param {string} sessionId - Session identifier
 * @return {Promise<FieldOption[]>} - Select options
 */

export const juniorCandidates = async (sessionId: string): Promise<FieldOption[]> => {
  const accounts = await prisma.account.findMany({
    where: {
      status: { not: MemberStatuses.Left },
      academyJuniors: { none: { sessionId } },
    },
    orderBy: { displayName: 'asc' },
  })

  return accounts.map((account) => ({ value: account.id, label: account.displayName }))
}

/**
 * Shape one session row
 * @param {object} row - Session row with its trainers and counts
 * @return {SessionSummary} - Session summary
 */

const toSummary = (row: {
  id: string
  functionId: string
  startsAt: Date
  endsAt: Date | null
  status: AcademySessionStatusName
  summary: string | null
  jobFunction: { id: string; name: string; summary: string | null; accent: string | null }
  trainers: { account: { id: string; displayName: string; avatarUrl: string | null } }[]
  _count: { juniors: number }
  invites: { token: string; expiresAt: Date; maxUses: number | null; uses: number }[]
}): SessionSummary => {
  const invite = row.invites[0]
  const inviteUsable =
    invite && invite.expiresAt > new Date() && invite.uses < (invite.maxUses ?? Infinity)

  return {
    id: row.id,
    function: row.jobFunction,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt?.toISOString() ?? null,
    status: row.status,
    summary: row.summary,
    trainers: row.trainers
      .map((seat) => toPerson(seat.account))
      .filter((person) => person !== null),
    juniorCount: row._count.juniors,
    inviteToken: inviteUsable ? invite.token : null,
    values: {
      functionId: row.functionId,
      status: row.status,
      startsAt: row.startsAt.toISOString().slice(0, 10),
      endsAt: row.endsAt ? row.endsAt.toISOString().slice(0, 10) : null,
      trainerIds: row.trainers.map((seat) => seat.account.id),
      summary: row.summary,
    },
  }
}

// Everything a session row needs to become a summary
const SESSION_SHAPE = {
  jobFunction: true,
  trainers: { include: { account: true } },
  _count: { select: { juniors: true } },
  invites: { orderBy: { createdAt: 'desc' as const }, take: 1 },
} as const

/**
 * Read every session within scope, newest first, archived sessions left out
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<SessionSummary[]>} - Sessions
 */

export const listSessions = async (
  scope: Prisma.AcademySessionWhereInput
): Promise<SessionSummary[]> => {
  const rows = await prisma.academySession.findMany({
    where: { ...scope, status: { not: AcademySessionStatuses.Archived } },
    include: SESSION_SHAPE,
    orderBy: { startsAt: 'desc' },
  })

  return rows.map(toSummary)
}

/**
 * Shortest run a session may last, proposed when no end date is given
 * @param {Date} startsAt - First day of the session
 * @return {Date} - Proposed last day
 */

const proposedEnd = (startsAt: Date): Date =>
  addDays(startsAt, ACADEMY_SETTINGS.weeksMin * WEEK_GRID_DAYS)

/**
 * Turn parsed values into a session payload
 * @param {FormValues} values - Parsed body
 * @return {object} - Database payload
 */

const toSessionData = (values: FormValues) => {
  const startsAt = readDate(values, 'startsAt') ?? new Date()

  return {
    functionId: readText(values, 'functionId') ?? '',
    status: (readText(values, 'status') ??
      AcademySessionStatuses.Draft) as AcademySessionStatusName,
    startsAt,
    // An unset end date lands on the shortest run the settings allow
    endsAt: readDate(values, 'endsAt') ?? proposedEnd(startsAt),
    summary: readText(values, 'summary'),
  }
}

/**
 * Load a session inside scope or fail
 * @param {string} id - Session identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<{ id: string, functionId: string }>} - Session row
 */

const sessionInScope = async (id: string, scope: Prisma.AcademySessionWhereInput) => {
  const row = await prisma.academySession.findFirst({ where: { id, ...scope } })
  if (!row) throw notFound()

  return row
}

/**
 * Open the integration link of a session once it starts taking applications, idempotent
 * @param {string} sessionId - Session identifier
 * @param {AcademySessionStatusName} status - Status the session was just set to
 * @return {Promise<void>} - Applied, a no-op outside OPEN or when a live link already exists
 */

const ensureSessionInvite = async (
  sessionId: string,
  status: AcademySessionStatusName
): Promise<void> => {
  if (status !== AcademySessionStatuses.Open) return

  const existing = await prisma.integrationInvite.findFirst({
    where: { sessionId, expiresAt: { gt: new Date() } },
  })
  if (existing) return

  const session = await prisma.academySession.findUniqueOrThrow({
    where: { id: sessionId },
    select: { functionId: true },
  })

  await prisma.integrationInvite.create({
    data: {
      kind: IntegrationLinkKinds.Academy,
      sessionId,
      functionId: session.functionId,
      token: crypto.randomBytes(24).toString('base64url'),
      expiresAt: addDays(new Date(), ACADEMY_SETTINGS.inviteExpiryDays),
      maxUses: ACADEMY_SETTINGS.inviteMaxUses,
    },
  })
}

/**
 * Open a session
 * @param {FormValues} values - Parsed body
 * @return {Promise<SessionSummary[]>} - Sessions
 */

export const createSession = async (values: FormValues): Promise<SessionSummary[]> => {
  const row = await prisma.academySession.create({
    data: {
      ...toSessionData(values),
      trainers: { create: readList(values, 'trainerIds').map((accountId) => ({ accountId })) },
    },
  })

  await Promise.all([
    instantiateSessionSteps(row.id, row.functionId, row.startsAt),
    ensureSessionInvite(row.id, row.status),
  ])

  return listSessions({})
}

/**
 * Edit a session
 * @param {string} id - Session identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {FormValues} values - Parsed body
 * @return {Promise<SessionSummary[]>} - Sessions
 */

export const updateSession = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput,
  values: FormValues
): Promise<SessionSummary[]> => {
  await sessionInScope(id, scope)
  const data = toSessionData(values)

  // The trainer seats are replaced wholesale, the form always sends the full list
  await prisma.$transaction([
    prisma.academySession.update({ where: { id }, data }),
    prisma.academySessionTrainer.deleteMany({ where: { sessionId: id } }),
    prisma.academySessionTrainer.createMany({
      data: readList(values, 'trainerIds').map((accountId) => ({ sessionId: id, accountId })),
    }),
  ])

  await ensureSessionInvite(id, data.status)

  return listSessions(scope)
}

/**
 * Close and drop a session
 * @param {string} id - Session identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<SessionSummary[]>} - Sessions
 */

export const removeSession = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<SessionSummary[]> => {
  await sessionInScope(id, scope)
  await prisma.academySession.delete({ where: { id } })

  return listSessions(scope)
}

/**
 * Shape one junior row with its progression
 * @param {object} row - Junior row
 * @param {object[]} trainings - Trainings of the programme
 * @return {JuniorView} - Junior view
 */

const toJunior = (
  row: {
    id: string
    sessionId: string
    accountId: string
    dispositifId: string
    status: AcademyJuniorStatusName
    stage: AcademyStageName
    startedAt: Date
    validatedAt: Date | null
    liveCount: number
    bonusLives: number
    summary: string | null
    trainerId: string | null
    account: { displayName: string; avatarUrl: string | null }
    trainer: { id: string; displayName: string; avatarUrl: string | null } | null
    dispositif: { id: string; name: string; accent: string | null }
    _count: { reviews: number }
  },
  trainings: {
    id: string
    name: string
    period: JuniorTraining['period']
    mandatory: boolean
  }[],
  records: Map<string, { completedAt: Date | null; validator: { displayName: string } | null }>
): JuniorView => {
  const progression: JuniorTraining[] = trainings.map((training) => {
    const record = records.get(training.id)

    return {
      id: training.id,
      name: training.name,
      period: training.period,
      mandatory: training.mandatory,
      completedAt: record?.completedAt?.toISOString() ?? null,
      validatorName: record?.validator?.displayName ?? null,
    }
  })

  return {
    id: row.id,
    sessionId: row.sessionId,
    accountId: row.accountId,
    displayName: row.account.displayName,
    avatarUrl: row.account.avatarUrl,
    dispositif: row.dispositif,
    status: row.status,
    stage: row.stage,
    trainer: toPerson(row.trainer),
    startedAt: row.startedAt.toISOString(),
    validatedAt: row.validatedAt?.toISOString() ?? null,
    liveCount: row.liveCount,
    bonusLives: row.bonusLives,
    summary: row.summary,
    trainings: progression,
    completedCount: progression.filter((training) => training.completedAt !== null).length,
    mandatoryPending: progression.filter(
      (training) => training.mandatory && training.completedAt === null
    ).length,
    reviewCount: row._count.reviews,
    values: {
      accountId: row.accountId,
      trainerId: row.trainerId,
      dispositifId: row.dispositifId,
      status: row.status,
      liveCount: row.liveCount,
      bonusLives: row.bonusLives,
      summary: row.summary,
    },
  }
}

// Everything a junior row needs to become a view
const JUNIOR_SHAPE = {
  account: { include: { trainingRecords: { include: { validator: true } } } },
  trainer: true,
  dispositif: true,
  _count: { select: { reviews: true } },
} as const

/**
 * Read the trainings a function covers, the shared ones always included
 * @param {string} functionId - Function identifier
 * @param {string} [dispositifId] - Dispositif identifier, every dispositif when omitted
 * @return {Promise<object[]>} - Trainings in display order
 */

const sessionTrainings = (functionId: string, dispositifId?: string | null) =>
  prisma.training.findMany({
    where: {
      OR: [{ functionId: null }, { functionId }],
      ...(dispositifId !== undefined
        ? { AND: [{ OR: [{ dispositifId: null }, { dispositifId }] }] }
        : {}),
    },
    orderBy: [{ period: 'asc' }, { position: 'asc' }],
  })

/**
 * Read every junior of a session
 * @param {string} sessionId - Session identifier
 * @param {string} functionId - Function identifier
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const listJuniors = async (sessionId: string, functionId: string): Promise<JuniorView[]> => {
  const [rows, trainings] = await Promise.all([
    prisma.academyJunior.findMany({
      where: { sessionId },
      include: JUNIOR_SHAPE,
      orderBy: [{ status: 'asc' }, { startedAt: 'asc' }],
    }),
    sessionTrainings(functionId),
  ])

  return rows.map((row) =>
    toJunior(
      row,
      // Each junior keeps only the trainings open to their own dispositif
      trainings.filter(
        (training) => training.dispositifId === null || training.dispositifId === row.dispositifId
      ),
      new Map(row.account.trainingRecords.map((record) => [record.trainingId, record]))
    )
  )
}

/**
 * Shape one free thread moment or timeline step
 * @param {object} row - Step row
 * @return {AcademyStepView} - Step view
 */

const toStep = (row: {
  id: string
  kind: AcademyStepKindName | null
  title: string
  scheduledAt: Date | null
  doneAt: Date | null
  notes: string | null
  juniorId: string | null
  templateId: string | null
  stage: AcademyStageName | null
  anchor: StepAnchorName | null
  offset: number | null
  owner: StepOwnerName | null
  required: boolean
  validatedAt: Date | null
  junior: { accountId: string; liveCount: number; account: { displayName: string } } | null
  author: { displayName: string } | null
  validator: { displayName: string } | null
}): AcademyStepView => ({
  id: row.id,
  kind: row.kind,
  title: row.title,
  scheduledAt: row.scheduledAt?.toISOString() ?? null,
  doneAt: row.doneAt?.toISOString() ?? null,
  notes: row.notes,
  juniorId: row.juniorId,
  accountId: row.junior?.accountId ?? null,
  juniorName: row.junior?.account.displayName ?? null,
  authorName: row.author?.displayName ?? null,
  templateId: row.templateId,
  stage: row.stage,
  anchor: row.anchor,
  offset: row.offset,
  owner: row.owner,
  required: row.required,
  validatedAt: row.validatedAt?.toISOString() ?? null,
  validatedByName: row.validator?.displayName ?? null,
  state:
    row.stage === null
      ? null
      : resolveStepState(
          {
            anchor: row.anchor,
            scheduledAt: row.scheduledAt,
            offset: row.offset,
            validatedAt: row.validatedAt,
          },
          { liveCount: row.junior?.liveCount ?? 0 }
        ),
  values: {
    kind: row.kind,
    title: row.title,
    scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString().slice(0, 16) : null,
    juniorId: row.juniorId,
    notes: row.notes,
  },
})

// Everything a step row needs to become a view
const EVENT_SHAPE = {
  junior: { include: { account: true } },
  author: true,
  validator: true,
} as const

/**
 * Read the thread and the timeline of a session
 * @param {string} sessionId - Session identifier
 * @return {Promise<AcademyStepView[]>} - Steps, newest planned first
 */

export const listSteps = async (sessionId: string): Promise<AcademyStepView[]> => {
  const rows = await prisma.academyStep.findMany({
    where: { sessionId },
    include: EVENT_SHAPE,
    orderBy: [{ scheduledAt: { sort: 'desc', nulls: 'first' } }, { createdAt: 'desc' }],
  })

  return rows.map(toStep)
}

/**
 * Compute the day a DAY-anchored template step falls on
 * @param {Date} startsAt - Session start date
 * @param {number} offsetDays - Signed day offset
 * @return {Date} - Resolved day
 */

const dayOffset = (startsAt: Date, offsetDays: number): Date => addDays(startsAt, offsetDays)

/**
 * Copy a batch of PIMT templates onto the timeline as steps
 * @param {object[]} templates - Templates matched for this instantiation
 * @param {Date} startsAt - Session start date
 * @param {string} sessionId - Session identifier
 * @param {string} [juniorId] - Junior identifier, omitted for session-wide steps
 * @return {Promise<void>} - Instantiated
 */

const instantiateSteps = async (
  templates: {
    id: string
    title: string
    description: string | null
    stage: AcademyStageName
    anchor: StepAnchorName
    offset: number
    owner: StepOwnerName
    required: boolean
  }[],
  startsAt: Date,
  sessionId: string,
  juniorId?: string
): Promise<void> => {
  if (templates.length === 0) return

  await prisma.academyStep.createMany({
    data: templates.map((template) => ({
      sessionId,
      juniorId: juniorId ?? null,
      templateId: template.id,
      kind: null,
      title: template.title,
      notes: template.description,
      stage: template.stage,
      anchor: template.anchor,
      offset: template.offset,
      owner: template.owner,
      required: template.required,
      scheduledAt:
        template.anchor === StepAnchors.Day ? dayOffset(startsAt, template.offset) : null,
    })),
  })
}

/**
 * Instantiate the session-wide preparation steps of a PIMT trame, ahead of any junior
 * @param {string} sessionId - Session identifier
 * @param {string} functionId - Function the session is scoped to
 * @param {Date} startsAt - Session start date
 * @return {Promise<void>} - Instantiated
 */

const instantiateSessionSteps = async (
  sessionId: string,
  functionId: string,
  startsAt: Date
): Promise<void> => {
  const templates = await prisma.pimStepTemplate.findMany({
    where: {
      OR: [{ functionId: null }, { functionId }],
      dispositifId: null,
      stage: AcademyStages.Preparation,
    },
  })

  await instantiateSteps(templates, startsAt, sessionId)
}

/**
 * Instantiate the individual steps of a PIMT trame onto a junior's own timeline
 * @param {string} juniorId - Junior identifier
 * @param {string} sessionId - Session identifier
 * @param {string} functionId - Function the session is scoped to
 * @param {string} dispositifId - Junior's own dispositif
 * @param {Date} startsAt - Session start date
 * @return {Promise<void>} - Instantiated
 */

export const instantiateJuniorSteps = async (
  juniorId: string,
  sessionId: string,
  functionId: string,
  dispositifId: string,
  startsAt: Date
): Promise<void> => {
  const templates = await prisma.pimStepTemplate.findMany({
    where: {
      OR: [{ functionId: null }, { functionId }],
      AND: [{ OR: [{ dispositifId: null }, { dispositifId }] }],
      stage: { not: AcademyStages.Preparation },
    },
  })

  await instantiateSteps(templates, startsAt, sessionId, juniorId)
}

/**
 * Read one whole session within scope
 * @param {string} id - Session identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<SessionDetail>} - Session detail
 */

export const readSession = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<SessionDetail> => {
  const row = await prisma.academySession.findFirst({
    where: { id, ...scope },
    include: SESSION_SHAPE,
  })
  if (!row) throw notFound()

  const [juniors, steps] = await Promise.all([listJuniors(id, row.functionId), listSteps(id)])

  return { summary: toSummary(row), juniors, steps }
}

/**
 * Turn parsed values into a junior payload
 * @param {FormValues} values - Parsed body
 * @return {object} - Database payload
 */

const toJuniorData = (values: FormValues) => {
  const status = (readText(values, 'status') ??
    AcademyJuniorStatuses.Active) as AcademyJuniorStatusName

  return {
    trainerId: readText(values, 'trainerId'),
    dispositifId: readText(values, 'dispositifId') ?? '',
    status,
    // Validation stamps its own date, so the file always says when it happened
    validatedAt: status === AcademyJuniorStatuses.Validated ? new Date() : null,
    liveCount: readNumberValue(values, 'liveCount') ?? 0,
    bonusLives: readNumberValue(values, 'bonusLives') ?? 0,
    summary: readText(values, 'summary'),
  }
}

/**
 * Take a moderator into a session, instantiating their own slice of the timeline
 * @param {string} sessionId - Session identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {FormValues} values - Parsed body
 * @return {Promise<{ juniors: JuniorView[], steps: AcademyStepView[] }>} - Juniors and the refreshed timeline
 */

export const createJunior = async (
  sessionId: string,
  scope: Prisma.AcademySessionWhereInput,
  values: FormValues
): Promise<{ juniors: JuniorView[]; steps: AcademyStepView[] }> => {
  const session = await sessionInScope(sessionId, scope)

  const junior = await prisma.academyJunior.create({
    data: {
      sessionId,
      accountId: readText(values, 'accountId') ?? '',
      ...toJuniorData(values),
    },
  })

  await instantiateJuniorSteps(
    junior.id,
    sessionId,
    session.functionId,
    junior.dispositifId,
    session.startsAt
  )

  const [juniors, steps] = await Promise.all([
    listJuniors(sessionId, session.functionId),
    listSteps(sessionId),
  ])

  return { juniors, steps }
}

/**
 * Load a junior inside scope or fail
 * @param {string} id - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<{ id: string, sessionId: string, accountId: string, session: { functionId: string } }>} - Junior row
 */

const juniorInScope = async (id: string, scope: Prisma.AcademySessionWhereInput) => {
  const row = await prisma.academyJunior.findFirst({
    where: { id, session: scope },
    include: { session: true },
  })
  if (!row) throw notFound()

  return row
}

/**
 * Read only what a self-read authorisation check needs
 * @param {string} id - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<{ accountId: string }>} - Owning account
 */

export const juniorAccount = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<{ accountId: string }> => {
  const row = await prisma.academyJunior.findFirst({
    where: { id, session: scope },
    select: { accountId: true },
  })
  if (!row) throw notFound()

  return row
}

/**
 * Edit the follow-up of a junior
 * @param {string} id - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {FormValues} values - Parsed body
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const updateJunior = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput,
  values: FormValues
): Promise<JuniorView[]> => {
  await juniorInScope(id, scope)

  const row = await prisma.academyJunior.update({
    where: { id },
    data: toJuniorData(values),
    include: { session: true },
  })

  // A validated junior leaves the academy status behind on their own file
  if (row.status === AcademyJuniorStatuses.Validated) {
    await prisma.account.update({
      where: { id: row.accountId },
      data: { status: MemberStatuses.Active },
    })
  }

  return listJuniors(row.sessionId, row.session.functionId)
}

/**
 * Take a junior out of a session
 * @param {string} id - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const removeJunior = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<JuniorView[]> => {
  await juniorInScope(id, scope)

  const row = await prisma.academyJunior.delete({ where: { id }, include: { session: true } })

  return listJuniors(row.sessionId, row.session.functionId)
}

/**
 * Validate or revoke one training of a junior
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {string} trainingId - Training identifier
 * @param {boolean} validated - Wanted state
 * @param {string} validatorId - Who validated it
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const setTrainingRecord = async (
  juniorId: string,
  scope: Prisma.AcademySessionWhereInput,
  trainingId: string,
  validated: boolean,
  validatorId: string
): Promise<JuniorView[]> => {
  const junior = await juniorInScope(juniorId, scope)

  // A clearance moves the record to done, a revoke is a correction back to in progress
  const status = validated ? TrainingStatuses.Done : TrainingStatuses.InProgress

  await prisma.trainingRecord.upsert({
    where: { trainingId_accountId: { trainingId, accountId: junior.accountId } },
    update: {
      status,
      completedAt: validated ? new Date() : null,
      validatorId: validated ? validatorId : null,
      juniorId,
    },
    create: {
      trainingId,
      accountId: junior.accountId,
      status,
      startedAt: new Date(),
      completedAt: validated ? new Date() : null,
      validatorId: validated ? validatorId : null,
      juniorId,
    },
  })

  return listJuniors(junior.sessionId, junior.session.functionId)
}

/**
 * Turn parsed values into a thread payload
 * @param {FormValues} values - Parsed body
 * @return {object} - Database payload
 */

const toStepData = (values: FormValues) => ({
  kind: (readText(values, 'kind') ?? '') as AcademyStepKindName,
  title: readText(values, 'title') ?? '',
  scheduledAt: readDate(values, 'scheduledAt') ?? new Date(),
  juniorId: readText(values, 'juniorId'),
  notes: readText(values, 'notes'),
})

/**
 * Load a step inside scope or fail
 * @param {string} id - Step identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<{ id: string, sessionId: string }>} - Step row
 */

const stepInScope = async (id: string, scope: Prisma.AcademySessionWhereInput) => {
  const row = await prisma.academyStep.findFirst({ where: { id, session: scope } })
  if (!row) throw notFound()

  return row
}

/**
 * Note a moment on the session thread
 * @param {string} sessionId - Session identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {string} authorId - Who records it
 * @param {FormValues} values - Parsed body
 * @return {Promise<AcademyStepView[]>} - Moments
 */

export const createStep = async (
  sessionId: string,
  scope: Prisma.AcademySessionWhereInput,
  authorId: string,
  values: FormValues
): Promise<AcademyStepView[]> => {
  await sessionInScope(sessionId, scope)
  await prisma.academyStep.create({ data: { sessionId, authorId, ...toStepData(values) } })

  return listSteps(sessionId)
}

/**
 * Edit a moment
 * @param {string} id - Step identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {FormValues} values - Parsed body
 * @return {Promise<AcademyStepView[]>} - Moments
 */

export const updateStep = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput,
  values: FormValues
): Promise<AcademyStepView[]> => {
  await stepInScope(id, scope)

  const row = await prisma.academyStep.update({ where: { id }, data: toStepData(values) })

  return listSteps(row.sessionId)
}

/**
 * Flip a moment between planned and held
 * @param {string} id - Step identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {boolean} done - Wanted state
 * @return {Promise<AcademyStepView[]>} - Moments
 */

export const setStepDone = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput,
  done: boolean
): Promise<AcademyStepView[]> => {
  await stepInScope(id, scope)

  const row = await prisma.academyStep.update({
    where: { id },
    data: { doneAt: done ? new Date() : null },
  })

  return listSteps(row.sessionId)
}

/**
 * Clear or reopen a timeline step, refusing to skip an earlier late one
 * @param {string} id - Step identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {boolean} validated - Wanted state
 * @param {string} validatedById - Who clears it
 * @return {Promise<AcademyStepView[]>} - Steps
 */

export const setStepValidated = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput,
  validated: boolean,
  validatedById: string
): Promise<AcademyStepView[]> => {
  const step = await prisma.academyStep.findFirst({
    where: { id, session: scope },
    include: { junior: true, template: true },
  })
  if (!step || step.stage === null) throw notFound()

  if (validated) {
    const earlier = await prisma.academyStep.findMany({
      where: {
        // A session-wide step (no junior yet) is only blocked by its own session-wide siblings
        sessionId: step.sessionId,
        juniorId: step.juniorId,
        stage: step.stage,
        id: { not: id },
        template: { position: { lt: step.template?.position ?? 0 } },
      },
    })

    const isBlocked = earlier.some(
      (sibling) =>
        resolveStepState(
          {
            anchor: sibling.anchor,
            scheduledAt: sibling.scheduledAt,
            offset: sibling.offset,
            validatedAt: sibling.validatedAt,
          },
          { liveCount: step.junior?.liveCount ?? 0 }
        ) === 'late'
    )

    if (isBlocked) throw conflict()
  }

  const row = await prisma.academyStep.update({
    where: { id },
    data: {
      validatedAt: validated ? new Date() : null,
      validatedById: validated ? validatedById : null,
    },
  })

  return listSteps(row.sessionId)
}

/**
 * Drop a moment
 * @param {string} id - Step identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<AcademyStepView[]>} - Moments
 */

export const removeStep = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<AcademyStepView[]> => {
  await stepInScope(id, scope)

  const row = await prisma.academyStep.delete({ where: { id } })

  return listSteps(row.sessionId)
}

/**
 * Shape one voice check-in
 * @param {object} row - Review row
 * @return {AcademyReviewView} - Review view
 */

const toReview = (row: {
  id: string
  stage: AcademyStageName
  heldAt: Date
  durationMinutes: number | null
  feeling: string | null
  summary: string
  advice: ReviewAdviceName
  status: ReviewStatusName
  decidedAt: Date | null
  decisionNote: string | null
  author: { displayName: string } | null
  decidedBy: { displayName: string } | null
}): AcademyReviewView => ({
  id: row.id,
  stage: row.stage,
  heldAt: row.heldAt.toISOString(),
  durationMinutes: row.durationMinutes,
  authorName: row.author?.displayName ?? null,
  feeling: row.feeling,
  summary: row.summary,
  advice: row.advice,
  status: row.status,
  decidedByName: row.decidedBy?.displayName ?? null,
  decidedAt: row.decidedAt?.toISOString() ?? null,
  decisionNote: row.decisionNote,
  values: {
    stage: row.stage,
    heldAt: row.heldAt.toISOString().slice(0, 10),
    durationMinutes: row.durationMinutes,
    feeling: row.feeling,
    summary: row.summary,
    advice: row.advice,
  },
})

// Everything a review row needs to become a view
const REVIEW_SHAPE = { author: true, decidedBy: true } as const

/**
 * Read the voice check-ins of a junior within scope
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<AcademyReviewView[]>} - Reviews, newest first
 */

export const listReviews = async (
  juniorId: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<AcademyReviewView[]> => {
  await juniorInScope(juniorId, scope)

  const rows = await prisma.academyReview.findMany({
    where: { juniorId },
    include: REVIEW_SHAPE,
    orderBy: { heldAt: 'desc' },
  })

  return rows.map(toReview)
}

/**
 * Turn parsed values into a review payload
 * @param {FormValues} values - Parsed body
 * @return {object} - Database payload
 */

const toReviewData = (values: FormValues) => ({
  stage: (readText(values, 'stage') ?? AcademyStages.ReviewOne) as AcademyStageName,
  heldAt: readDate(values, 'heldAt') ?? new Date(),
  durationMinutes: readNumberValue(values, 'durationMinutes'),
  feeling: readText(values, 'feeling'),
  summary: readText(values, 'summary') ?? '',
  advice: (readText(values, 'advice') ?? ReviewAdvices.Pass) as ReviewAdviceName,
})

/**
 * Write the trace of a voice check-in
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {string} authorId - Who held it
 * @param {FormValues} values - Parsed body
 * @return {Promise<AcademyReviewView[]>} - Reviews
 */

export const createReview = async (
  juniorId: string,
  scope: Prisma.AcademySessionWhereInput,
  authorId: string,
  values: FormValues
): Promise<AcademyReviewView[]> => {
  await juniorInScope(juniorId, scope)
  await prisma.academyReview.create({ data: { juniorId, authorId, ...toReviewData(values) } })

  return listReviews(juniorId, scope)
}

/**
 * Load a review inside scope or fail
 * @param {string} id - Review identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<{ id: string, juniorId: string, status: ReviewStatusName, stage: AcademyStageName, advice: ReviewAdviceName }>} - Review row
 */

const reviewInScope = async (id: string, scope: Prisma.AcademySessionWhereInput) => {
  const row = await prisma.academyReview.findFirst({ where: { id, junior: { session: scope } } })
  if (!row) throw notFound()

  return row
}

/**
 * Edit the trace of a voice check-in, only possible while still a draft
 * @param {string} id - Review identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {FormValues} values - Parsed body
 * @return {Promise<AcademyReviewView[]>} - Reviews
 */

export const updateReview = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput,
  values: FormValues
): Promise<AcademyReviewView[]> => {
  const existing = await reviewInScope(id, scope)
  if (existing.status !== ReviewStatuses.Draft) throw conflict()

  const row = await prisma.academyReview.update({ where: { id }, data: toReviewData(values) })

  return listReviews(row.juniorId, scope)
}

/**
 * Drop the trace of a voice check-in, a validated decision is kept for good
 * @param {string} id - Review identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<AcademyReviewView[]>} - Reviews
 */

export const removeReview = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<AcademyReviewView[]> => {
  const existing = await reviewInScope(id, scope)
  if (existing.status === ReviewStatuses.Validated) throw conflict()

  const row = await prisma.academyReview.delete({ where: { id } })

  return listReviews(row.juniorId, scope)
}

/**
 * Submit a check-in for decision, only possible once from a draft
 * @param {string} id - Review identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<AcademyReviewView[]>} - Reviews
 */

export const submitReview = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<AcademyReviewView[]> => {
  const existing = await reviewInScope(id, scope)
  if (existing.status !== ReviewStatuses.Draft) throw conflict()

  const row = await prisma.academyReview.update({
    where: { id },
    data: { status: ReviewStatuses.Submitted },
  })

  return listReviews(row.juniorId, scope)
}

/**
 * Refuse a decision while a required step of its stage is still open
 * @param {string} juniorId - Junior identifier
 * @param {AcademyStageName} stage - Stage being closed
 * @return {Promise<void>} - Throws when a step is still pending
 */

const ensureStepsCleared = async (juniorId: string, stage: AcademyStageName): Promise<void> => {
  const pending = await prisma.academyStep.count({
    where: { juniorId, stage, required: true, validatedAt: null },
  })

  if (pending > 0) throw conflict()
}

/**
 * Refuse a decision while a mandatory training is still open
 * @param {{ session: { functionId: string }, dispositifId: string, accountId: string }} junior - Junior being closed
 * @return {Promise<void>} - Throws when a training is still pending
 */

const ensureTrainingsCleared = async (junior: {
  session: { functionId: string }
  dispositifId: string
  accountId: string
}): Promise<void> => {
  const [trainings, records] = await Promise.all([
    sessionTrainings(junior.session.functionId, junior.dispositifId),
    prisma.trainingRecord.findMany({ where: { accountId: junior.accountId } }),
  ])

  const completed = new Set(
    records.filter((record) => record.completedAt !== null).map((record) => record.trainingId)
  )
  const mandatoryPending = trainings.some(
    (training) => training.mandatory && !completed.has(training.id)
  )

  if (mandatoryPending) throw conflict()
}

/**
 * Refuse a decision when the FSI is not ready for it yet
 * @param {{ juniorId: string, stage: AcademyStageName }} review - Review being decided
 * @return {Promise<void>} - Throws when a guard fails
 */

const ensureReadyForDecision = async (review: {
  juniorId: string
  stage: AcademyStageName
}): Promise<void> => {
  const junior = await prisma.academyJunior.findUniqueOrThrow({
    where: { id: review.juniorId },
    include: { session: true },
  })

  await Promise.all([
    ensureStepsCleared(review.juniorId, review.stage),
    ensureTrainingsCleared(junior),
  ])

  // Only the closing check-ins gate on the objectives written during practice
  if (review.stage !== AcademyStages.ReviewFinal && review.stage !== AcademyStages.Bonus) return

  const count = await prisma.juniorObjective.count({ where: { juniorId: review.juniorId } })
  if (count < ACADEMY_SETTINGS.minObjectives) throw conflict()
}

/**
 * Move a junior forward once their check-in is validated
 * @param {string} juniorId - Junior identifier
 * @param {AcademyStageName} stage - Stage the check-in was held for
 * @param {ReviewAdviceName} advice - Outcome proposed by the Formateur
 * @return {Promise<void>} - Applied
 */

const advanceJunior = async (
  juniorId: string,
  stage: AcademyStageName,
  advice: ReviewAdviceName
): Promise<void> => {
  if (advice === ReviewAdvices.Stop) {
    await prisma.academyJunior.update({
      where: { id: juniorId },
      data: { status: AcademyJuniorStatuses.Stopped },
    })
    return
  }

  if (stage === AcademyStages.ReviewOne) {
    await prisma.academyJunior.update({
      where: { id: juniorId },
      data: { stage: AcademyStages.Practice },
    })
    return
  }

  if (stage === AcademyStages.ReviewFinal && advice === ReviewAdvices.Bonus) {
    await prisma.academyJunior.update({
      where: { id: juniorId },
      data: { stage: AcademyStages.Bonus },
    })
    return
  }

  // A passed final check-in, or a closing bonus period, both graduate the junior
  const junior = await prisma.academyJunior.update({
    where: { id: juniorId },
    data: { status: AcademyJuniorStatuses.Validated, validatedAt: new Date() },
  })

  await prisma.account.update({
    where: { id: junior.accountId },
    data: { status: MemberStatuses.Active },
  })
}

/**
 * Decide a submitted check-in, the sole gesture that authorises the following stage
 * @param {string} id - Review identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {string} decidedById - Who decided
 * @param {FormValues} values - Parsed body
 * @return {Promise<AcademyReviewView[]>} - Reviews
 */

export const decideReview = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput,
  decidedById: string,
  values: FormValues
): Promise<AcademyReviewView[]> => {
  const existing = await reviewInScope(id, scope)
  if (existing.status !== ReviewStatuses.Submitted) throw conflict()

  const status = (
    readText(values, 'status') === ReviewStatuses.Validated
      ? ReviewStatuses.Validated
      : ReviewStatuses.Rejected
  ) as ReviewStatusName

  if (status === ReviewStatuses.Validated) await ensureReadyForDecision(existing)

  const row = await prisma.academyReview.update({
    where: { id },
    data: {
      status,
      decidedById,
      decidedAt: new Date(),
      decisionNote: readText(values, 'decisionNote'),
    },
  })

  if (status === ReviewStatuses.Validated) await advanceJunior(row.juniorId, row.stage, row.advice)

  return listReviews(row.juniorId, scope)
}

/**
 * Shape one competency grade
 * @param {object} skill - Skill row with its category
 * @param {object} [grade] - Existing grade, absent means never touched
 * @return {JuniorSkillView} - Skill view
 */

const toJuniorSkill = (
  skill: {
    id: string
    name: string
    description: string | null
    categoryId: string
    category: { name: string; accent: string | null }
  },
  grade?: { percent: number; updatedAt: Date; validator: { displayName: string } | null }
): JuniorSkillView => ({
  skillId: skill.id,
  name: skill.name,
  description: skill.description,
  categoryId: skill.categoryId,
  categoryName: skill.category.name,
  categoryAccent: skill.category.accent,
  percent: grade?.percent ?? 0,
  validatorName: grade?.validator?.displayName ?? null,
  updatedAt: grade?.updatedAt.toISOString() ?? null,
})

/**
 * Read the competencies open to a junior's function and dispositif
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<JuniorSkillView[]>} - Skills grouped by category order
 */

export const listJuniorSkills = async (
  juniorId: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<JuniorSkillView[]> => {
  const junior = await juniorInScope(juniorId, scope)

  const [skills, grades] = await Promise.all([
    prisma.skill.findMany({
      where: {
        OR: [{ functionId: null }, { functionId: junior.session.functionId }],
        AND: [{ OR: [{ dispositifId: null }, { dispositifId: junior.dispositifId }] }],
      },
      include: { category: true },
      orderBy: [{ category: { position: 'asc' } }, { position: 'asc' }],
    }),
    prisma.juniorSkill.findMany({ where: { juniorId }, include: { validator: true } }),
  ])

  const gradeBySkill = new Map(grades.map((grade) => [grade.skillId, grade]))

  return skills.map((skill) => toJuniorSkill(skill, gradeBySkill.get(skill.id)))
}

/**
 * Move the mastery of one competency
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {string} skillId - Skill identifier
 * @param {number} percent - Wanted mastery
 * @param {string} validatorId - Who moved it
 * @return {Promise<JuniorSkillView[]>} - Skills
 */

export const setJuniorSkill = async (
  juniorId: string,
  scope: Prisma.AcademySessionWhereInput,
  skillId: string,
  percent: number,
  validatorId: string
): Promise<JuniorSkillView[]> => {
  await juniorInScope(juniorId, scope)

  const bounded = Math.min(Math.max(percent, 0), ACADEMY_SETTINGS.skillMaxPercent)

  await prisma.juniorSkill.upsert({
    where: { juniorId_skillId: { juniorId, skillId } },
    update: { percent: bounded, validatorId },
    create: { juniorId, skillId, percent: bounded, validatorId },
  })

  return listJuniorSkills(juniorId, scope)
}

/**
 * Shape one FSI note
 * @param {object} row - Note row
 * @return {JuniorNoteView} - Note view
 */

const toJuniorNote = (row: {
  id: string
  stage: AcademyStageName
  kind: NoteKindName
  body: string
  createdAt: Date
  author: { displayName: string } | null
}): JuniorNoteView => ({
  id: row.id,
  stage: row.stage,
  kind: row.kind,
  body: decryptField(row.body) ?? '',
  authorName: row.author?.displayName ?? null,
  createdAt: row.createdAt.toISOString(),
  values: { stage: row.stage, kind: row.kind, body: row.body },
})

/**
 * Read the notes kept on a junior's FSI
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<JuniorNoteView[]>} - Notes, newest first
 */

export const listJuniorNotes = async (
  juniorId: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<JuniorNoteView[]> => {
  await juniorInScope(juniorId, scope)

  const rows = await prisma.juniorNote.findMany({
    where: { juniorId },
    include: { author: true },
    orderBy: { createdAt: 'desc' },
  })

  return rows.map(toJuniorNote)
}

/**
 * Turn parsed values into a note payload
 * @param {FormValues} values - Parsed body
 * @return {object} - Database payload
 */

const toJuniorNoteData = (values: FormValues) => ({
  stage: (readText(values, 'stage') ?? AcademyStages.Preparation) as AcademyStageName,
  kind: (readText(values, 'kind') ?? NoteKinds.Positive) as NoteKindName,
  body: encryptField(readText(values, 'body')) ?? '',
})

/**
 * Write a trace on a junior's FSI
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {string} authorId - Who wrote it
 * @param {FormValues} values - Parsed body
 * @return {Promise<JuniorNoteView[]>} - Notes
 */

export const createJuniorNote = async (
  juniorId: string,
  scope: Prisma.AcademySessionWhereInput,
  authorId: string,
  values: FormValues
): Promise<JuniorNoteView[]> => {
  await juniorInScope(juniorId, scope)
  await prisma.juniorNote.create({ data: { juniorId, authorId, ...toJuniorNoteData(values) } })

  return listJuniorNotes(juniorId, scope)
}

/**
 * Load a note inside scope or fail
 * @param {string} id - Note identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<{ id: string, juniorId: string }>} - Note row
 */

const noteInScope = async (id: string, scope: Prisma.AcademySessionWhereInput) => {
  const row = await prisma.juniorNote.findFirst({ where: { id, junior: { session: scope } } })
  if (!row) throw notFound()

  return row
}

/**
 * Edit a trace kept on a junior's FSI
 * @param {string} id - Note identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {FormValues} values - Parsed body
 * @return {Promise<JuniorNoteView[]>} - Notes
 */

export const updateJuniorNote = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput,
  values: FormValues
): Promise<JuniorNoteView[]> => {
  const existing = await noteInScope(id, scope)
  await prisma.juniorNote.update({ where: { id }, data: toJuniorNoteData(values) })

  return listJuniorNotes(existing.juniorId, scope)
}

/**
 * Drop a trace kept on a junior's FSI
 * @param {string} id - Note identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<JuniorNoteView[]>} - Notes
 */

export const removeJuniorNote = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<JuniorNoteView[]> => {
  const row = await noteInScope(id, scope)
  await prisma.juniorNote.delete({ where: { id } })

  return listJuniorNotes(row.juniorId, scope)
}

/**
 * Shape one personal objective
 * @param {object} row - Objective row
 * @return {JuniorObjectiveView} - Objective view
 */

const toJuniorObjective = (row: {
  id: string
  title: string
  description: string | null
  dueAt: Date | null
  status: ObjectiveStatusName
  position: number
  author: { displayName: string } | null
}): JuniorObjectiveView => ({
  id: row.id,
  title: row.title,
  description: row.description,
  dueAt: row.dueAt?.toISOString() ?? null,
  status: row.status,
  position: row.position,
  authorName: row.author?.displayName ?? null,
  values: {
    title: row.title,
    description: row.description,
    dueAt: row.dueAt ? row.dueAt.toISOString().slice(0, 10) : null,
    status: row.status,
  },
})

/**
 * Read the personal objectives of a junior
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<JuniorObjectiveView[]>} - Objectives in display order
 */

export const listJuniorObjectives = async (
  juniorId: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<JuniorObjectiveView[]> => {
  await juniorInScope(juniorId, scope)

  const rows = await prisma.juniorObjective.findMany({
    where: { juniorId },
    include: { author: true },
    orderBy: { position: 'asc' },
  })

  return rows.map(toJuniorObjective)
}

/**
 * Read the next free position of a junior's objectives
 * @param {string} juniorId - Junior identifier
 * @return {Promise<number>} - Next position
 */

const nextObjectivePosition = async (juniorId: string): Promise<number> => {
  const result = await prisma.juniorObjective.aggregate({
    where: { juniorId },
    _max: { position: true },
  })

  return (result._max.position ?? -1) + 1
}

/**
 * Turn parsed values into an objective payload
 * @param {FormValues} values - Parsed body
 * @return {object} - Database payload
 */

const toJuniorObjectiveData = (values: FormValues) => ({
  title: readText(values, 'title') ?? '',
  description: readText(values, 'description'),
  dueAt: readDate(values, 'dueAt'),
  status: (readText(values, 'status') ?? ObjectiveStatuses.Open) as ObjectiveStatusName,
})

/**
 * Set a personal objective, unlocked once a junior reaches practice
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {string} authorId - Who set it
 * @param {FormValues} values - Parsed body
 * @return {Promise<JuniorObjectiveView[]>} - Objectives
 */

export const createJuniorObjective = async (
  juniorId: string,
  scope: Prisma.AcademySessionWhereInput,
  authorId: string,
  values: FormValues
): Promise<JuniorObjectiveView[]> => {
  await juniorInScope(juniorId, scope)
  const position = await nextObjectivePosition(juniorId)

  await prisma.juniorObjective.create({
    data: { juniorId, authorId, position, ...toJuniorObjectiveData(values) },
  })

  return listJuniorObjectives(juniorId, scope)
}

/**
 * Load an objective inside scope or fail
 * @param {string} id - Objective identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<{ id: string, juniorId: string }>} - Objective row
 */

const objectiveInScope = async (id: string, scope: Prisma.AcademySessionWhereInput) => {
  const row = await prisma.juniorObjective.findFirst({ where: { id, junior: { session: scope } } })
  if (!row) throw notFound()

  return row
}

/**
 * Edit a personal objective
 * @param {string} id - Objective identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {FormValues} values - Parsed body
 * @return {Promise<JuniorObjectiveView[]>} - Objectives
 */

export const updateJuniorObjective = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput,
  values: FormValues
): Promise<JuniorObjectiveView[]> => {
  const existing = await objectiveInScope(id, scope)
  await prisma.juniorObjective.update({ where: { id }, data: toJuniorObjectiveData(values) })

  return listJuniorObjectives(existing.juniorId, scope)
}

/**
 * Drop a personal objective
 * @param {string} id - Objective identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<JuniorObjectiveView[]>} - Objectives
 */

export const removeJuniorObjective = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<JuniorObjectiveView[]> => {
  const row = await objectiveInScope(id, scope)
  await prisma.juniorObjective.delete({ where: { id } })

  return listJuniorObjectives(row.juniorId, scope)
}

/**
 * Apply a new order to a junior's objectives
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {string[]} ids - Identifiers in their new order
 * @return {Promise<JuniorObjectiveView[]>} - Objectives
 */

export const reorderJuniorObjectives = async (
  juniorId: string,
  scope: Prisma.AcademySessionWhereInput,
  ids: string[]
): Promise<JuniorObjectiveView[]> => {
  await juniorInScope(juniorId, scope)
  await Promise.all(
    ids.map((id, position) => prisma.juniorObjective.update({ where: { id }, data: { position } }))
  )

  return listJuniorObjectives(juniorId, scope)
}

/**
 * Read one junior on their own, for the individual follow-up file
 * @param {string} id - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<{ junior: JuniorView, session: SessionSummary }>} - Junior and its session
 */

export const readJunior = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<{ junior: JuniorView; session: SessionSummary }> => {
  const row = await prisma.academyJunior.findFirst({
    where: { id, session: scope },
    include: { ...JUNIOR_SHAPE, session: { include: SESSION_SHAPE } },
  })

  if (!row) throw notFound()

  const trainings = await sessionTrainings(row.session.functionId, row.dispositifId)
  const records = new Map(row.account.trainingRecords.map((record) => [record.trainingId, record]))

  return { junior: toJunior(row, trainings, records), session: toSummary(row.session) }
}

/**
 * Resolve the FSI a signed-in junior acts on
 * @param {string} accountId - Signed-in member identifier
 * @return {Promise<{ id: string, sessionId: string, dispositifId: string, session: { functionId: string } } | null>} - Active FSI, or none
 */

export const resolveOwnJunior = async (
  accountId: string
): Promise<{
  id: string
  sessionId: string
  dispositifId: string
  session: { functionId: string }
} | null> =>
  prisma.academyJunior.findFirst({
    where: { accountId, status: AcademyJuniorStatuses.Active },
    include: { session: { select: { functionId: true } } },
    orderBy: { startedAt: 'desc' },
  })

/**
 * Shape one training on a junior's own progression page
 * @param {object} training - Training row
 * @param {object} [record] - Existing attendance, absent means never touched
 * @return {MyTrainingView} - Training view
 */

const toMyTraining = (
  training: {
    id: string
    name: string
    summary: string | null
    period: JuniorTraining['period']
    mandatory: boolean
  },
  record?: {
    status: TrainingStatusName
    attempts: number
    startedAt: Date | null
    completedAt: Date | null
    abandonedAt: Date | null
  }
): MyTrainingView => ({
  id: training.id,
  name: training.name,
  summary: training.summary,
  period: training.period,
  mandatory: training.mandatory,
  status: record?.status ?? TrainingStatuses.NotStarted,
  attempts: record?.attempts ?? 0,
  startedAt: record?.startedAt?.toISOString() ?? null,
  completedAt: record?.completedAt?.toISOString() ?? null,
  abandonedAt: record?.abandonedAt?.toISOString() ?? null,
})

/**
 * Read the trainings open to a junior's own function and dispositif
 * @param {string} accountId - Signed-in member identifier
 * @param {string} functionId - Function identifier
 * @param {string} dispositifId - Dispositif identifier
 * @return {Promise<MyTrainingView[]>} - Trainings in display order
 */

export const myTrainings = async (
  accountId: string,
  functionId: string,
  dispositifId: string
): Promise<MyTrainingView[]> => {
  const [trainings, records] = await Promise.all([
    sessionTrainings(functionId, dispositifId),
    prisma.trainingRecord.findMany({ where: { accountId } }),
  ])

  const recordByTraining = new Map(records.map((record) => [record.trainingId, record]))

  return trainings.map((training) => toMyTraining(training, recordByTraining.get(training.id)))
}

/**
 * Clear the nearest open training moment logged on a junior's thread
 * @param {string} juniorId - Junior identifier
 * @return {Promise<void>} - Applied, a no-op when nothing is open
 */

const clearOpenTrainingStep = async (juniorId: string): Promise<void> => {
  const step = await prisma.academyStep.findFirst({
    where: { juniorId, kind: AcademyStepKinds.Training, doneAt: null },
    orderBy: { scheduledAt: 'asc' },
  })
  if (!step) return

  await prisma.academyStep.update({ where: { id: step.id }, data: { doneAt: new Date() } })
}

/**
 * Move a junior's own attendance on one training
 * @param {string} trainingId - Training identifier
 * @param {string} accountId - Signed-in member identifier
 * @param {string} juniorId - FSI the move is stamped with
 * @param {MyTrainingAction} action - Move applied
 * @return {Promise<{ view: MyTrainingView, completed: boolean }>} - Updated training, and whether it just finished
 */

const applyMyTraining = async (
  trainingId: string,
  accountId: string,
  juniorId: string,
  action: MyTrainingAction
): Promise<{ view: MyTrainingView; completed: boolean }> => {
  const existing = await prisma.trainingRecord.findUnique({
    where: { trainingId_accountId: { trainingId, accountId } },
  })

  const data =
    action === 'start'
      ? { status: TrainingStatuses.InProgress, startedAt: new Date(), juniorId }
      : action === 'resume'
        ? { status: TrainingStatuses.InProgress, abandonedAt: null, juniorId }
        : action === 'restart'
          ? {
              status: TrainingStatuses.InProgress,
              attempts: (existing?.attempts ?? 0) + 1,
              startedAt: new Date(),
              completedAt: null,
              abandonedAt: null,
              juniorId,
            }
          : action === 'abandon'
            ? { status: TrainingStatuses.Abandoned, abandonedAt: new Date() }
            : { status: TrainingStatuses.Done, completedAt: new Date() }

  const row = await prisma.trainingRecord.upsert({
    where: { trainingId_accountId: { trainingId, accountId } },
    update: data,
    create: { trainingId, accountId, startedAt: new Date(), ...data },
  })

  const training = await prisma.training.findUniqueOrThrow({ where: { id: trainingId } })

  return { view: toMyTraining(training, row), completed: action === 'complete' }
}

/**
 * Move a junior's own attendance on one training, refusing to touch anyone else's FSI
 * @param {string} trainingId - Training identifier
 * @param {string} accountId - Signed-in member identifier
 * @param {MyTrainingAction} action - Move applied
 * @return {Promise<MyTrainingView[]>} - Trainings open to the junior
 */

export const setMyTraining = async (
  trainingId: string,
  accountId: string,
  action: MyTrainingAction
): Promise<MyTrainingView[]> => {
  const junior = await resolveOwnJunior(accountId)
  if (!junior) throw notFound()

  const open = await sessionTrainings(junior.session.functionId, junior.dispositifId)
  if (!open.some((training) => training.id === trainingId)) throw notFound()

  const { completed } = await applyMyTraining(trainingId, accountId, junior.id, action)
  if (completed) await clearOpenTrainingStep(junior.id)

  return myTrainings(accountId, junior.session.functionId, junior.dispositifId)
}
