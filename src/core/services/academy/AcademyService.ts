import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { toOptions } from '@/core/lib/forms/options'
import { readDate, readList, readNumberValue, readText } from '@/core/lib/forms/values'
import { memberOptions, toPerson } from '@/core/services/work/shared'
import { ACADEMY_FIELD_COPY } from '@/declarations/academy/copy'
import {
  ACADEMY_STEP_KIND_REGISTRY,
  ACADEMY_JUNIOR_STATUS_REGISTRY,
  ACADEMY_PROGRAM_REGISTRY,
  ACADEMY_SESSION_STATUS_REGISTRY,
  ACADEMY_TRACK_REGISTRY,
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
  AcademyPrograms,
  AcademySessionStatuses,
  AcademyTracks,
  MemberStatuses,
} from '@/utils/constants/hierarchy'
import type {
  AcademyStepKindName,
  AcademyJuniorStatusName,
  AcademyProgramName,
  AcademySessionStatusName,
  AcademyTrackName,
} from '@/utils/constants/hierarchy'

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
  const members = await memberOptions()

  return [
    {
      name: 'program',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.program,
      required: true,
      options: toOptions(ACADEMY_PROGRAM_REGISTRY),
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
    { name: 'endsAt', kind: 'date', label: ACADEMY_FIELD_COPY.endsAt, span: 'half' },
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
  const [candidates, trainers] = await Promise.all([juniorCandidates(sessionId), memberOptions()])

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
      name: 'track',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.track,
      required: true,
      options: toOptions(ACADEMY_TRACK_REGISTRY),
      mark: 'dot',
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
  program: AcademyProgramName
  startsAt: Date
  endsAt: Date | null
  status: AcademySessionStatusName
  summary: string | null
  trainers: { account: { id: string; displayName: string; avatarUrl: string | null } }[]
  _count: { juniors: number }
}): SessionSummary => ({
  id: row.id,
  program: row.program,
  startsAt: row.startsAt.toISOString(),
  endsAt: row.endsAt?.toISOString() ?? null,
  status: row.status,
  summary: row.summary,
  trainers: row.trainers.map((seat) => toPerson(seat.account)).filter((person) => person !== null),
  juniorCount: row._count.juniors,
  values: {
    program: row.program,
    status: row.status,
    startsAt: row.startsAt.toISOString().slice(0, 10),
    endsAt: row.endsAt ? row.endsAt.toISOString().slice(0, 10) : null,
    trainerIds: row.trainers.map((seat) => seat.account.id),
    summary: row.summary,
  },
})

// Everything a session row needs to become a summary
const SESSION_SHAPE = {
  trainers: { include: { account: true } },
  _count: { select: { juniors: true } },
} as const

/**
 * Read every session, newest first
 * @return {Promise<SessionSummary[]>} - Sessions
 */

export const listSessions = async (): Promise<SessionSummary[]> => {
  const rows = await prisma.academySession.findMany({
    include: SESSION_SHAPE,
    orderBy: { startsAt: 'desc' },
  })

  return rows.map(toSummary)
}

/**
 * Turn parsed values into a session payload
 * @param {FormValues} values - Parsed body
 * @return {object} - Database payload
 */

const toSessionData = (values: FormValues) => ({
  program: (readText(values, 'program') ?? AcademyPrograms.Polyvalent) as AcademyProgramName,
  status: (readText(values, 'status') ??
    AcademySessionStatuses.Planned) as AcademySessionStatusName,
  startsAt: readDate(values, 'startsAt') ?? new Date(),
  endsAt: readDate(values, 'endsAt'),
  summary: readText(values, 'summary'),
})

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

  return listSessions()
}

/**
 * Edit a session
 * @param {string} id - Session identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<SessionSummary[]>} - Sessions
 */

export const updateSession = async (id: string, values: FormValues): Promise<SessionSummary[]> => {
  // The trainer seats are replaced wholesale, the form always sends the full list
  await prisma.$transaction([
    prisma.academySession.update({ where: { id }, data: toSessionData(values) }),
    prisma.academySessionTrainer.deleteMany({ where: { sessionId: id } }),
    prisma.academySessionTrainer.createMany({
      data: readList(values, 'trainerIds').map((accountId) => ({ sessionId: id, accountId })),
    }),
  ])

  return listSessions()
}

/**
 * Close and drop a session
 * @param {string} id - Session identifier
 * @return {Promise<SessionSummary[]>} - Sessions
 */

export const removeSession = async (id: string): Promise<SessionSummary[]> => {
  await prisma.academySession.delete({ where: { id } })

  return listSessions()
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
    track: AcademyTrackName
    status: AcademyJuniorStatusName
    startedAt: Date
    validatedAt: Date | null
    liveCount: number
    summary: string | null
    trainerId: string | null
    account: { displayName: string; avatarUrl: string | null }
    trainer: { id: string; displayName: string; avatarUrl: string | null } | null
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
    track: row.track,
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
      track: row.track,
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
  _count: { select: { reviews: true } },
} as const

/**
 * Read the trainings a programme covers, the shared ones always included
 * @param {AcademyProgramName} program - Training programme
 * @return {Promise<object[]>} - Trainings in display order
 */

const programTrainings = (program: AcademyProgramName) =>
  prisma.training.findMany({
    where: { OR: [{ program: null }, { program }] },
    orderBy: [{ period: 'asc' }, { position: 'asc' }],
  })

/**
 * Read every junior of a session
 * @param {string} sessionId - Session identifier
 * @param {AcademyProgramName} program - Training programme
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const listJuniors = async (
  sessionId: string,
  program: AcademyProgramName
): Promise<JuniorView[]> => {
  const [rows, trainings] = await Promise.all([
    prisma.academyJunior.findMany({
      where: { sessionId },
      include: JUNIOR_SHAPE,
      orderBy: [{ status: 'asc' }, { startedAt: 'asc' }],
    }),
    programTrainings(program),
  ])

  return rows.map((row) =>
    toJunior(
      row,
      trainings,
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
 * Read one whole session
 * @param {string} id - Session identifier
 * @return {Promise<SessionDetail>} - Session detail
 */

export const readSession = async (id: string): Promise<SessionDetail> => {
  const row = await prisma.academySession.findUnique({ where: { id }, include: SESSION_SHAPE })
  if (!row) throw notFound()

  const [juniors, steps] = await Promise.all([listJuniors(id, row.program), listSteps(id)])

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
    track: (readText(values, 'track') ?? AcademyTracks.Entry) as AcademyTrackName,
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
 * @param {AcademyProgramName} program - Training programme
 * @param {FormValues} values - Parsed body
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const createJunior = async (
  sessionId: string,
  program: AcademyProgramName,
  values: FormValues
): Promise<JuniorView[]> => {
  await prisma.academyJunior.create({
    data: {
      sessionId,
      accountId: readText(values, 'accountId') ?? '',
      ...toJuniorData(values),
    },
  })

  return listJuniors(sessionId, program)
}

/**
 * Edit the follow-up of a junior
 * @param {string} id - Junior identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const updateJunior = async (id: string, values: FormValues): Promise<JuniorView[]> => {
  const row = await prisma.academyJunior.update({
    where: { id },
    data: toJuniorData(values),
    include: { session: true },
  })

  // A validated junior leaves the academy status behind on their own file
  if (row.status === AcademyJuniorStatuses.Validated) {
    await prisma.account.update({
      where: { id: row.accountId },
      data: { status: MemberStatuses.Active, academyPeriod: null },
    })
  }

  return listJuniors(row.sessionId, row.session.program)
}

/**
 * Take a junior out of a session
 * @param {string} id - Junior identifier
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const removeJunior = async (id: string): Promise<JuniorView[]> => {
  const row = await prisma.academyJunior.delete({ where: { id }, include: { session: true } })

  return listJuniors(row.sessionId, row.session.program)
}

/**
 * Validate or revoke one training of a junior
 * @param {string} juniorId - Junior identifier
 * @param {string} trainingId - Training identifier
 * @param {boolean} validated - Wanted state
 * @param {string} validatorId - Who validated it
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const setTrainingRecord = async (
  juniorId: string,
  trainingId: string,
  validated: boolean,
  validatorId: string
): Promise<JuniorView[]> => {
  const junior = await prisma.academyJunior.findUnique({
    where: { id: juniorId },
    include: { session: true },
  })

  if (!junior) throw notFound()

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

  return listJuniors(junior.sessionId, junior.session.program)
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
 * Note a moment on the session thread
 * @param {string} sessionId - Session identifier
 * @param {string} authorId - Who records it
 * @param {FormValues} values - Parsed body
 * @return {Promise<AcademyStepView[]>} - Moments
 */

export const createStep = async (
  sessionId: string,
  authorId: string,
  values: FormValues
): Promise<AcademyStepView[]> => {
  await prisma.academyStep.create({ data: { sessionId, authorId, ...toStepData(values) } })

  return listSteps(sessionId)
}

/**
 * Edit a moment
 * @param {string} id - Step identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<AcademyStepView[]>} - Moments
 */

export const updateStep = async (id: string, values: FormValues): Promise<AcademyStepView[]> => {
  const row = await prisma.academyStep.update({ where: { id }, data: toStepData(values) })

  return listSteps(row.sessionId)
}

/**
 * Flip a moment between planned and held
 * @param {string} id - Step identifier
 * @param {boolean} done - Wanted state
 * @return {Promise<AcademyStepView[]>} - Moments
 */

export const setStepDone = async (id: string, done: boolean): Promise<AcademyStepView[]> => {
  const row = await prisma.academyStep.update({
    where: { id },
    data: { doneAt: done ? new Date() : null },
  })

  return listSteps(row.sessionId)
}

/**
 * Drop a moment
 * @param {string} id - Step identifier
 * @return {Promise<AcademyStepView[]>} - Moments
 */

export const removeStep = async (id: string): Promise<AcademyStepView[]> => {
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
 * Read the voice check-ins of a junior
 * @param {string} juniorId - Junior identifier
 * @return {Promise<AcademyReviewView[]>} - Reviews, newest first
 */

export const listReviews = async (juniorId: string): Promise<AcademyReviewView[]> => {
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
 * @param {string} authorId - Who held it
 * @param {FormValues} values - Parsed body
 * @return {Promise<AcademyReviewView[]>} - Reviews
 */

export const createReview = async (
  juniorId: string,
  authorId: string,
  values: FormValues
): Promise<AcademyReviewView[]> => {
  await prisma.academyReview.create({ data: { juniorId, authorId, ...toReviewData(values) } })

  return listReviews(juniorId)
}

/**
 * Edit the trace of a voice check-in
 * @param {string} id - Review identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<AcademyReviewView[]>} - Reviews
 */

export const updateReview = async (
  id: string,
  values: FormValues
): Promise<AcademyReviewView[]> => {
  const row = await prisma.academyReview.update({ where: { id }, data: toReviewData(values) })

  return listReviews(row.juniorId)
}

/**
 * Drop the trace of a voice check-in
 * @param {string} id - Review identifier
 * @return {Promise<AcademyReviewView[]>} - Reviews
 */

export const removeReview = async (id: string): Promise<AcademyReviewView[]> => {
  const row = await prisma.academyReview.delete({ where: { id } })

  return listReviews(row.juniorId)
}

/**
 * Read one junior on their own, for the individual follow-up file
 * @param {string} id - Junior identifier
 * @return {Promise<{ junior: JuniorView, session: SessionSummary }>} - Junior and its session
 */

export const readJunior = async (
  id: string
): Promise<{ junior: JuniorView; session: SessionSummary }> => {
  const row = await prisma.academyJunior.findUnique({
    where: { id },
    include: { ...JUNIOR_SHAPE, session: { include: SESSION_SHAPE } },
  })

  if (!row) throw notFound()

  const trainings = await programTrainings(row.session.program)
  const records = new Map(row.account.trainingRecords.map((record) => [record.trainingId, record]))

  return { junior: toJunior(row, trainings, records), session: toSummary(row.session) }
}
