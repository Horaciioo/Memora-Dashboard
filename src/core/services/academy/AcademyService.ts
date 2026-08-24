import 'server-only'

import moment from 'moment'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { rowsToOptions, toOptions } from '@/core/lib/forms/options'
import { readDate, readList, readNumberValue, readText } from '@/core/lib/forms/values'
import { memberOptions, toPerson } from '@/core/services/work/shared'
import { ACADEMY_FIELD_COPY } from '@/declarations/academy/copy'
import {
  ACADEMY_STEP_KIND_REGISTRY,
  ACADEMY_JUNIOR_STATUS_REGISTRY,
  ACADEMY_SESSION_STATUS_REGISTRY,
} from '@/declarations/academy/registries'
import { ACADEMY_SETTINGS, FORM_SETTINGS } from '@/declarations/configurations/settings'
import type {
  AcademyStepView,
  AcademyReviewView,
  JuniorTraining,
  JuniorView,
  SessionDetail,
  SessionSummary,
} from '@/types/academy'
import type { FieldDefinition, FieldOption, FormValues } from '@/types/forms'
import {
  AcademyJuniorStatuses,
  AcademySessionStatuses,
  MemberStatuses,
} from '@/utils/constants/hierarchy'
import type {
  AcademyStepKindName,
  AcademyJuniorStatusName,
  AcademySessionStatusName,
} from '@/utils/constants/hierarchy'
import type { Prisma } from '@prisma/client'

// Axes every voice check-in walks through, in the order they are asked
const REVIEW_AXES = [
  { name: 'inclusion', label: ACADEMY_FIELD_COPY.inclusion },
  { name: 'speaking', label: ACADEMY_FIELD_COPY.speaking },
  { name: 'writing', label: ACADEMY_FIELD_COPY.writing },
  { name: 'reachingOut', label: ACADEMY_FIELD_COPY.reachingOut },
  { name: 'understanding', label: ACADEMY_FIELD_COPY.understanding },
  { name: 'technical', label: ACADEMY_FIELD_COPY.technical },
] as const

/**
 * Labels of the axes, read by the surfaces that render a stored review
 * @type {{ name: string, label: string }[]}
 */

export const ACADEMY_REVIEW_AXES = REVIEW_AXES

/**
 * Build the session form declarations
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const sessionFields = async (): Promise<FieldDefinition[]> => {
  const [members, functions] = await Promise.all([
    memberOptions(),
    prisma.jobFunction.findMany({ where: { archived: false }, orderBy: { position: 'asc' } }),
  ])

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
 * Declarations of the voice check-in form, its axes coming from the procedure itself
 * @type {FieldDefinition[]}
 */

export const REVIEW_FIELDS: FieldDefinition[] = [
  {
    name: 'heldAt',
    kind: 'date',
    label: ACADEMY_FIELD_COPY.heldAt,
    required: true,
    span: 'half',
  },
  {
    name: 'feeling',
    kind: 'textarea',
    label: ACADEMY_FIELD_COPY.feeling,
    required: true,
    maxLength: FORM_SETTINGS.noteMaxLength,
  },
  ...REVIEW_AXES.map((axis): FieldDefinition => ({
    name: axis.name,
    kind: 'textarea',
    label: axis.label,
    maxLength: FORM_SETTINGS.longTextMaxLength,
    span: 'half',
  })),
  {
    name: 'objectives',
    kind: 'textarea',
    label: ACADEMY_FIELD_COPY.objectives,
    required: true,
    maxLength: FORM_SETTINGS.noteMaxLength,
  },
  {
    name: 'strategies',
    kind: 'textarea',
    label: ACADEMY_FIELD_COPY.strategies,
    maxLength: FORM_SETTINGS.noteMaxLength,
  },
  {
    name: 'summary',
    kind: 'markdown',
    label: ACADEMY_FIELD_COPY.reviewSummary,
    maxLength: FORM_SETTINGS.markdownMaxLength,
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
}): SessionSummary => ({
  id: row.id,
  function: row.jobFunction,
  startsAt: row.startsAt.toISOString(),
  endsAt: row.endsAt?.toISOString() ?? null,
  status: row.status,
  summary: row.summary,
  trainers: row.trainers.map((seat) => toPerson(seat.account)).filter((person) => person !== null),
  juniorCount: row._count.juniors,
  values: {
    functionId: row.functionId,
    status: row.status,
    startsAt: row.startsAt.toISOString().slice(0, 10),
    endsAt: row.endsAt ? row.endsAt.toISOString().slice(0, 10) : null,
    trainerIds: row.trainers.map((seat) => seat.account.id),
    summary: row.summary,
  },
})

// Everything a session row needs to become a summary
const SESSION_SHAPE = {
  jobFunction: true,
  trainers: { include: { account: true } },
  _count: { select: { juniors: true } },
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
  moment(startsAt).add(ACADEMY_SETTINGS.weeksMin, 'weeks').toDate()

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
 * Open a session
 * @param {FormValues} values - Parsed body
 * @return {Promise<SessionSummary[]>} - Sessions
 */

export const createSession = async (values: FormValues): Promise<SessionSummary[]> => {
  await prisma.academySession.create({
    data: {
      ...toSessionData(values),
      trainers: { create: readList(values, 'trainerIds').map((accountId) => ({ accountId })) },
    },
  })

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

  // The trainer seats are replaced wholesale, the form always sends the full list
  await prisma.$transaction([
    prisma.academySession.update({ where: { id }, data: toSessionData(values) }),
    prisma.academySessionTrainer.deleteMany({ where: { sessionId: id } }),
    prisma.academySessionTrainer.createMany({
      data: readList(values, 'trainerIds').map((accountId) => ({ sessionId: id, accountId })),
    }),
  ])

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
    startedAt: Date
    validatedAt: Date | null
    liveCount: number
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
    trainer: toPerson(row.trainer),
    startedAt: row.startedAt.toISOString(),
    validatedAt: row.validatedAt?.toISOString() ?? null,
    liveCount: row.liveCount,
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
 * Shape one thread moment
 * @param {object} row - Step row
 * @return {AcademyStepView} - Step view
 */

const toStep = (row: {
  id: string
  kind: AcademyStepKindName
  title: string
  scheduledAt: Date
  doneAt: Date | null
  notes: string | null
  juniorId: string | null
  junior: { account: { displayName: string } } | null
  author: { displayName: string } | null
}): AcademyStepView => ({
  id: row.id,
  kind: row.kind,
  title: row.title,
  scheduledAt: row.scheduledAt.toISOString(),
  doneAt: row.doneAt?.toISOString() ?? null,
  notes: row.notes,
  juniorId: row.juniorId,
  juniorName: row.junior?.account.displayName ?? null,
  authorName: row.author?.displayName ?? null,
  values: {
    kind: row.kind,
    title: row.title,
    scheduledAt: row.scheduledAt.toISOString().slice(0, 16),
    juniorId: row.juniorId,
    notes: row.notes,
  },
})

// Everything an event row needs to become a view
const EVENT_SHAPE = {
  junior: { include: { account: true } },
  author: true,
} as const

/**
 * Read the thread of a session
 * @param {string} sessionId - Session identifier
 * @return {Promise<AcademyStepView[]>} - Moments, newest first
 */

export const listSteps = async (sessionId: string): Promise<AcademyStepView[]> => {
  const rows = await prisma.academyStep.findMany({
    where: { sessionId },
    include: EVENT_SHAPE,
    orderBy: { scheduledAt: 'desc' },
  })

  return rows.map(toStep)
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
    summary: readText(values, 'summary'),
  }
}

/**
 * Take a moderator into a session
 * @param {string} sessionId - Session identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {FormValues} values - Parsed body
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const createJunior = async (
  sessionId: string,
  scope: Prisma.AcademySessionWhereInput,
  values: FormValues
): Promise<JuniorView[]> => {
  const session = await sessionInScope(sessionId, scope)

  await prisma.academyJunior.create({
    data: {
      sessionId,
      accountId: readText(values, 'accountId') ?? '',
      ...toJuniorData(values),
    },
  })

  return listJuniors(sessionId, session.functionId)
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

  await prisma.trainingRecord.upsert({
    where: { trainingId_accountId: { trainingId, accountId: junior.accountId } },
    update: {
      completedAt: validated ? new Date() : null,
      validatorId: validated ? validatorId : null,
    },
    create: {
      trainingId,
      accountId: junior.accountId,
      completedAt: validated ? new Date() : null,
      validatorId: validated ? validatorId : null,
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
  heldAt: Date
  feeling: string | null
  axes: unknown
  objectives: string
  strategies: string | null
  summary: string | null
  author: { displayName: string } | null
}): AcademyReviewView => {
  const stored = (row.axes ?? {}) as Record<string, unknown>
  const axes = Object.fromEntries(
    REVIEW_AXES.map((axis) => [axis.name, String(stored[axis.name] ?? '')]).filter(
      ([, value]) => value.length > 0
    )
  )

  return {
    id: row.id,
    heldAt: row.heldAt.toISOString(),
    authorName: row.author?.displayName ?? null,
    feeling: row.feeling,
    axes,
    objectives: row.objectives,
    strategies: row.strategies,
    summary: row.summary,
    values: {
      heldAt: row.heldAt.toISOString().slice(0, 10),
      feeling: row.feeling,
      objectives: row.objectives,
      strategies: row.strategies,
      summary: row.summary,
      ...Object.fromEntries(REVIEW_AXES.map((axis) => [axis.name, axes[axis.name] ?? null])),
    },
  }
}

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
    include: { author: true },
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
  heldAt: readDate(values, 'heldAt') ?? new Date(),
  feeling: readText(values, 'feeling'),
  axes: Object.fromEntries(
    REVIEW_AXES.map((axis) => [axis.name, readText(values, axis.name) ?? '']).filter(
      ([, value]) => value.length > 0
    )
  ),
  objectives: readText(values, 'objectives') ?? '',
  strategies: readText(values, 'strategies'),
  summary: readText(values, 'summary'),
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
 * @return {Promise<{ id: string, juniorId: string }>} - Review row
 */

const reviewInScope = async (id: string, scope: Prisma.AcademySessionWhereInput) => {
  const row = await prisma.academyReview.findFirst({ where: { id, junior: { session: scope } } })
  if (!row) throw notFound()

  return row
}

/**
 * Edit the trace of a voice check-in
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
  await reviewInScope(id, scope)

  const row = await prisma.academyReview.update({ where: { id }, data: toReviewData(values) })

  return listReviews(row.juniorId, scope)
}

/**
 * Drop the trace of a voice check-in
 * @param {string} id - Review identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<AcademyReviewView[]>} - Reviews
 */

export const removeReview = async (
  id: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<AcademyReviewView[]> => {
  await reviewInScope(id, scope)

  const row = await prisma.academyReview.delete({ where: { id } })

  return listReviews(row.juniorId, scope)
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
