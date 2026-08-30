import 'server-only'

import { decryptField, encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { activeFunctions } from '@/core/services/reference/lookups'
import { conflict, notFound } from '@/core/lib/errors'
import { readDate, readFlag, readList, readNumberValue, readText } from '@/core/lib/forms/values'
import { toOptions } from '@/core/lib/forms/options'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { memberOptions, positionAt, toPerson, youtuberOptions } from '@/core/services/work/shared'
import { ACADEMY_SETTINGS, FORM_SETTINGS } from '@/declarations/configurations/settings'
import { RECRUITMENT_FIELD_COPY } from '@/declarations/recruitment/copy'
import {
  RECRUITMENT_OWNER_REGISTRY,
  RECRUITMENT_STATUS_REGISTRY,
} from '@/declarations/recruitment/registries'
import type { FieldDefinition, FieldOption, FormValues } from '@/types/forms'
import type {
  CandidateComment,
  CandidateView,
  RecruitmentDetail,
  RecruitmentOutcomeView,
  RecruitmentQuestionView,
  RecruitmentRef,
  RecruitmentStepView,
  RecruitmentSummary,
} from '@/types/recruitment'
import { RecruitmentOwners, RecruitmentStatuses } from '@/utils/constants/recruitment'
import type { RecruitmentOwnerName, RecruitmentStatusName } from '@/utils/constants/recruitment'

const { shortTextMaxLength, longTextMaxLength, markdownMaxLength, noteMaxLength } = FORM_SETTINGS

// A day of milliseconds, the step offset being counted from the session opening
const DAY_IN_MS = 24 * 60 * 60 * 1000

/**
 * Reject a duplicate session name or a candidate already held
 * @param {unknown} error - Caught value
 * @return {never} - Always throws
 */

const rethrow = (error: unknown): never => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    if ((error as { code: unknown }).code === 'P2002') throw conflict()
  }

  throw error
}

/**
 * Narrow a session query to the creators in perimeter
 * @param {AccessScope} scope - Perimeter
 * @return {object} - Where clause
 */

const sessionScope = (scope: AccessScope) => scopedWhere('recruitmentSession', scope)

/**
 * Read a session the viewer may reach, or throw
 * @param {string} id - Session identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<{ id: string, youtuberId: string, functionId: string, opensAt: Date | null }>} - Session anchors
 */

const reachableSession = async (id: string, scope: AccessScope) => {
  const row = await prisma.recruitmentSession.findFirst({
    where: { AND: [{ id }, sessionScope(scope)] },
    select: { id: true, youtuberId: true, functionId: true, opensAt: true },
  })

  if (!row) throw notFound()

  return row
}

/**
 * Read the session a candidate belongs to, guarding the perimeter
 * @param {string} candidateId - Candidate identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<string>} - Session identifier
 */

const reachableCandidate = async (candidateId: string, scope: AccessScope): Promise<string> => {
  const row = await prisma.recruitmentCandidate.findFirst({
    where: { AND: [{ id: candidateId }, { session: sessionScope(scope) }] },
    select: { sessionId: true },
  })

  if (!row) throw notFound()

  return row.sessionId
}

/**
 * Rows matching a session, a null creator or function meaning every one of them
 * @param {string} youtuberId - Creator of the session
 * @param {string} functionId - Post of the session
 * @return {object} - Where clause
 */

const trameFilter = (youtuberId: string, functionId: string) => ({
  archived: false,
  AND: [
    { OR: [{ youtuberId: null }, { youtuberId }] },
    { OR: [{ functionId: null }, { functionId }] },
  ],
})

/**
 * Map a reference row to the shape a session header renders
 * @param {{ id: string, name: string, accent: string | null, avatarUrl?: string | null }} row - Reference row
 * @return {RecruitmentRef} - Named row
 */

const toRef = (row: {
  id: string
  name: string
  accent: string | null
  avatarUrl?: string | null
}): RecruitmentRef => ({
  id: row.id,
  label: row.name,
  accent: row.accent,
  image: row.avatarUrl ?? null,
})

// Relations every session summary reads
const SUMMARY_INCLUDE = {
  youtuber: true,
  jobFunction: true,
  responsables: { include: { account: true } },
  _count: { select: { candidates: true } },
} as const

/**
 * Session row as the list renders it
 * @typedef {Object} SummaryRow
 */

type SummaryRow = Awaited<
  ReturnType<typeof prisma.recruitmentSession.findMany<{ include: typeof SUMMARY_INCLUDE }>>
>[number]

/**
 * Map a session row to its summary
 * @param {SummaryRow} row - Session row
 * @param {number} interviewedCount - Applicants who attended
 * @return {RecruitmentSummary} - Session header
 */

const toSummary = (row: SummaryRow, interviewedCount: number): RecruitmentSummary => {
  const responsables = row.responsables.map(({ account }) => ({
    id: account.id,
    label: account.displayName,
    accent: null,
    image: account.avatarUrl,
  }))

  return {
    id: row.id,
    name: row.name,
    status: row.status,
    summary: row.summary,
    youtuber: toRef(row.youtuber),
    jobFunction: toRef(row.jobFunction),
    responsables,
    opensAt: row.opensAt?.toISOString() ?? null,
    closesAt: row.closesAt?.toISOString() ?? null,
    candidateCount: row._count.candidates,
    interviewedCount,
    values: {
      name: row.name,
      youtuberId: row.youtuberId,
      functionId: row.functionId,
      status: row.status,
      summary: row.summary,
      opensAt: row.opensAt?.toISOString() ?? null,
      closesAt: row.closesAt?.toISOString() ?? null,
      responsableIds: responsables.map((seat) => seat.id),
    },
  }
}

/**
 * Declarations of the session form
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const sessionFields = async (scope: AccessScope): Promise<FieldDefinition[]> => {
  const [creators, functions, members] = await Promise.all([
    youtuberOptions(scope),
    activeFunctions(),
    memberOptions(),
  ])

  return [
    {
      name: 'name',
      kind: 'text',
      label: RECRUITMENT_FIELD_COPY.name,
      required: true,
      maxLength: shortTextMaxLength,
    },
    {
      name: 'youtuberId',
      kind: 'select',
      label: RECRUITMENT_FIELD_COPY.youtuber,
      required: true,
      options: creators,
      mark: 'avatar',
      span: 'half',
    },
    {
      name: 'functionId',
      kind: 'select',
      label: RECRUITMENT_FIELD_COPY.jobFunction,
      required: true,
      options: functions.map((row) => ({
        value: row.id,
        label: row.name,
        accent: row.accent ?? undefined,
      })),
      span: 'half',
    },
    {
      name: 'status',
      kind: 'select',
      label: RECRUITMENT_FIELD_COPY.status,
      required: true,
      options: toOptions(RECRUITMENT_STATUS_REGISTRY),
      mark: 'dot',
      span: 'half',
    },
    {
      name: 'opensAt',
      kind: 'date',
      label: RECRUITMENT_FIELD_COPY.opensAt,
      span: 'half',
    },
    {
      name: 'closesAt',
      kind: 'date',
      label: RECRUITMENT_FIELD_COPY.closesAt,
      span: 'half',
    },
    {
      name: 'responsableIds',
      kind: 'multiselect',
      label: RECRUITMENT_FIELD_COPY.responsables,
      options: members,
      mark: 'avatar',
    },
    {
      name: 'summary',
      kind: 'textarea',
      label: RECRUITMENT_FIELD_COPY.summary,
      maxLength: longTextMaxLength,
    },
  ]
}

/**
 * Declarations of the candidate form
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const candidateFields = async (): Promise<FieldDefinition[]> => {
  const [members, outcomes] = await Promise.all([
    memberOptions(),
    prisma.recruitmentOutcome.findMany({
      where: { archived: false },
      orderBy: { position: 'asc' },
    }),
  ])

  // Spectators may sit in even while absent, only a recruiter has to be available
  const seats: FieldOption[] = members.map((option) => ({
    value: option.value,
    label: option.label,
    image: option.image,
  }))

  return [
    {
      name: 'discordId',
      kind: 'discord',
      label: RECRUITMENT_FIELD_COPY.discordId,
      required: true,
      span: 'half',
    },
    {
      name: 'formId',
      kind: 'text',
      label: RECRUITMENT_FIELD_COPY.formId,
      maxLength: shortTextMaxLength,
      span: 'half',
    },
    {
      name: 'recruiterId',
      kind: 'select',
      label: RECRUITMENT_FIELD_COPY.recruiter,
      options: members,
      mark: 'avatar',
      span: 'half',
    },
    {
      name: 'interviewAt',
      kind: 'datetime',
      label: RECRUITMENT_FIELD_COPY.interviewAt,
      span: 'half',
    },
    {
      name: 'spectatorIds',
      kind: 'multiselect',
      label: RECRUITMENT_FIELD_COPY.spectators,
      options: seats,
      mark: 'avatar',
    },
    {
      name: 'outcomeId',
      kind: 'select',
      label: RECRUITMENT_FIELD_COPY.outcome,
      options: outcomes.map((row) => ({
        value: row.id,
        label: row.name,
        accent: row.accent ?? undefined,
      })),
      mark: 'dot',
      span: 'half',
    },
    {
      name: 'attended',
      kind: 'toggle',
      label: RECRUITMENT_FIELD_COPY.attended,
      span: 'half',
    },
  ]
}

/**
 * Declarations of the timeline step form
 * @return {FieldDefinition[]} - Field declarations
 */

export const stepFields = (): FieldDefinition[] => [
  {
    name: 'title',
    kind: 'text',
    label: RECRUITMENT_FIELD_COPY.title,
    required: true,
    maxLength: shortTextMaxLength,
  },
  {
    name: 'offset',
    kind: 'number',
    label: RECRUITMENT_FIELD_COPY.offset,
    required: true,
    min: ACADEMY_SETTINGS.stepOffsetMin,
    max: ACADEMY_SETTINGS.stepOffsetMax,
    span: 'half',
  },
  {
    name: 'owner',
    kind: 'select',
    label: RECRUITMENT_FIELD_COPY.owner,
    required: true,
    options: toOptions(RECRUITMENT_OWNER_REGISTRY),
    mark: 'dot',
    span: 'half',
  },
  {
    name: 'scheduledAt',
    kind: 'date',
    label: RECRUITMENT_FIELD_COPY.scheduledAt,
    span: 'half',
  },
  {
    name: 'required',
    kind: 'toggle',
    label: RECRUITMENT_FIELD_COPY.mandatory,
    span: 'half',
  },
  {
    name: 'notes',
    kind: 'textarea',
    label: RECRUITMENT_FIELD_COPY.notes,
    maxLength: noteMaxLength,
  },
]

/**
 * Declarations of the comment form
 * @return {FieldDefinition[]} - Field declarations
 */

export const commentFields = (): FieldDefinition[] => [
  {
    name: 'body',
    kind: 'textarea',
    label: RECRUITMENT_FIELD_COPY.comment,
    required: true,
    maxLength: noteMaxLength,
  },
]

/**
 * Declarations of the written trace forms, the bilan and the consignes
 * @param {'review' | 'instructions'} kind - Which trace is edited
 * @return {FieldDefinition[]} - Field declarations
 */

export const proseFields = (kind: 'review' | 'instructions'): FieldDefinition[] => [
  {
    name: kind,
    kind: 'markdown',
    label: kind === 'review' ? RECRUITMENT_FIELD_COPY.review : RECRUITMENT_FIELD_COPY.instructions,
    maxLength: markdownMaxLength,
  },
]

/**
 * Read every session in perimeter
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<RecruitmentSummary[]>} - Session headers
 */

export const listSessions = async (scope: AccessScope): Promise<RecruitmentSummary[]> => {
  const rows = await prisma.recruitmentSession.findMany({
    where: sessionScope(scope),
    orderBy: [{ opensAt: 'desc' }, { createdAt: 'desc' }],
    include: SUMMARY_INCLUDE,
  })

  // One grouped count rather than one query per session
  const attended = await prisma.recruitmentCandidate.groupBy({
    by: ['sessionId'],
    where: { sessionId: { in: rows.map((row) => row.id) }, attended: true },
    _count: { _all: true },
  })

  const attendedBySession = new Map(attended.map((row) => [row.sessionId, row._count._all]))

  return rows.map((row) => toSummary(row, attendedBySession.get(row.id) ?? 0))
}

/**
 * Map a candidate row to the shape the board renders
 * @param {object} row - Candidate row with its relations
 * @param {Map<string, { id: string, displayName: string }>} members - Moderators by Discord identifier
 * @return {CandidateView} - Candidate card
 */

const toCandidate = (
  row: {
    id: string
    discordId: string
    formId: string | null
    interviewAt: Date | null
    attended: boolean
    outcomeId: string | null
    review: string
    position: number
    recruiter: { id: string; displayName: string; avatarUrl: string | null } | null
    spectators: { account: { id: string; displayName: string; avatarUrl: string | null } }[]
    comments: {
      id: string
      body: string
      createdAt: Date
      author: { displayName: string } | null
    }[]
  },
  members: Map<string, { id: string; displayName: string }>
): CandidateView => {
  const member = members.get(row.discordId) ?? null
  const recruiter = toPerson(row.recruiter)

  const comments: CandidateComment[] = row.comments.map((comment) => ({
    id: comment.id,
    authorName: comment.author?.displayName ?? null,
    body: decryptField(comment.body) ?? '',
    createdAt: comment.createdAt.toISOString(),
  }))

  return {
    id: row.id,
    discordId: row.discordId,
    formId: row.formId,
    recruiter: recruiter
      ? { id: recruiter.id, label: recruiter.name, accent: null, image: recruiter.src }
      : null,
    spectators: row.spectators.map(({ account }) => ({
      id: account.id,
      label: account.displayName,
      accent: null,
      image: account.avatarUrl,
    })),
    interviewAt: row.interviewAt?.toISOString() ?? null,
    attended: row.attended,
    outcomeId: row.outcomeId,
    review: row.review,
    position: row.position,
    memberId: member?.id ?? null,
    memberName: member?.displayName ?? null,
    comments,
  }
}

/**
 * Read one session in full
 * @param {string} id - Session identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<RecruitmentDetail>} - Everything the session page renders
 */

export const readSession = async (id: string, scope: AccessScope): Promise<RecruitmentDetail> => {
  const row = await prisma.recruitmentSession.findFirst({
    where: { AND: [{ id }, sessionScope(scope)] },
    include: {
      ...SUMMARY_INCLUDE,
      steps: { orderBy: [{ offset: 'asc' }, { position: 'asc' }] },
      candidates: {
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        include: {
          recruiter: true,
          spectators: { include: { account: true } },
          comments: { orderBy: { createdAt: 'desc' }, include: { author: true } },
        },
      },
    },
  })

  if (!row) throw notFound()

  const filter = trameFilter(row.youtuberId, row.functionId)

  const [questions, outcomes, members] = await Promise.all([
    prisma.recruitmentQuestion.findMany({ where: filter, orderBy: { position: 'asc' } }),
    prisma.recruitmentOutcome.findMany({
      where: { archived: false },
      orderBy: { position: 'asc' },
    }),
    // The Discord identifier is the only bridge to a moderator file, no account is ever created
    prisma.account.findMany({
      where: { discordId: { in: row.candidates.map((candidate) => candidate.discordId) } },
      select: { id: true, discordId: true, displayName: true },
    }),
  ])

  const byDiscordId = new Map(members.map((member) => [member.discordId, member]))
  const attendedCount = row.candidates.filter((candidate) => candidate.attended).length

  const steps: RecruitmentStepView[] = row.steps.map((step) => ({
    id: step.id,
    title: step.title,
    notes: step.notes,
    owner: step.owner,
    offset: step.offset,
    scheduledAt: step.scheduledAt?.toISOString() ?? null,
    doneAt: step.doneAt?.toISOString() ?? null,
    required: step.required,
    position: step.position,
  }))

  const questionViews: RecruitmentQuestionView[] = questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    hint: question.hint,
  }))

  const outcomeViews: RecruitmentOutcomeView[] = outcomes.map((outcome) => ({
    id: outcome.id,
    label: outcome.name,
    accent: outcome.accent,
    isTerminal: outcome.isTerminal,
  }))

  return {
    summary: toSummary(row, attendedCount),
    instructions: row.instructions,
    candidates: row.candidates.map((candidate) => toCandidate(candidate, byDiscordId)),
    steps,
    questions: questionViews,
    outcomes: outcomeViews,
  }
}

/**
 * Open a session and lay its declared trame on the timeline
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<RecruitmentSummary>} - Session header
 */

export const createSession = async (
  values: FormValues,
  scope: AccessScope
): Promise<RecruitmentSummary> => {
  const youtuberId = readText(values, 'youtuberId') ?? ''
  const functionId = readText(values, 'functionId') ?? ''
  const opensAt = readDate(values, 'opensAt')

  if (!scope.isGlobal && !scope.youtuberIds.includes(youtuberId)) throw notFound()

  const templates = await prisma.recruitmentStepTemplate.findMany({
    where: trameFilter(youtuberId, functionId),
    orderBy: [{ offset: 'asc' }, { position: 'asc' }],
  })

  const row = await prisma.recruitmentSession
    .create({
      data: {
        name: readText(values, 'name') ?? '',
        youtuberId,
        functionId,
        status: (readText(values, 'status') ?? RecruitmentStatuses.Draft) as RecruitmentStatusName,
        summary: readText(values, 'summary'),
        opensAt,
        closesAt: readDate(values, 'closesAt'),
        responsables: {
          create: readList(values, 'responsableIds').map((accountId) => ({ accountId })),
        },
        steps: {
          create: templates.map((template, index) => ({
            templateId: template.id,
            title: template.title,
            notes: template.description,
            owner: template.owner,
            offset: template.offset,
            // A step only lands on a day once the session knows when it opens
            scheduledAt: opensAt ? new Date(opensAt.getTime() + template.offset * DAY_IN_MS) : null,
            required: template.required,
            position: index * FORM_SETTINGS.positionStep,
          })),
        },
      },
      include: SUMMARY_INCLUDE,
    })
    .catch(rethrow)

  return toSummary(row, 0)
}

/**
 * Edit a session
 * @param {string} id - Session identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<RecruitmentSummary>} - Session header
 */

export const updateSession = async (
  id: string,
  values: FormValues,
  scope: AccessScope
): Promise<RecruitmentSummary> => {
  await reachableSession(id, scope)

  // The responsable seats are replaced wholesale, the form always sends the full list
  const [, , , row] = await prisma
    .$transaction([
      prisma.recruitmentSession.update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          status: (readText(values, 'status') ?? undefined) as RecruitmentStatusName | undefined,
          summary: readText(values, 'summary'),
          opensAt: readDate(values, 'opensAt'),
          closesAt: readDate(values, 'closesAt'),
        },
      }),
      prisma.recruitmentResponsable.deleteMany({ where: { sessionId: id } }),
      prisma.recruitmentResponsable.createMany({
        data: readList(values, 'responsableIds').map((accountId) => ({ sessionId: id, accountId })),
      }),
      prisma.recruitmentSession.findUniqueOrThrow({ where: { id }, include: SUMMARY_INCLUDE }),
    ])
    .catch(rethrow)

  const attended = await prisma.recruitmentCandidate.count({
    where: { sessionId: id, attended: true },
  })

  return toSummary(row, attended)
}

/**
 * Write the consignes of a session
 * @param {string} id - Session identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<string>} - Consignes in force
 */

export const saveInstructions = async (
  id: string,
  values: FormValues,
  scope: AccessScope
): Promise<string> => {
  await reachableSession(id, scope)

  const row = await prisma.recruitmentSession.update({
    where: { id },
    data: { instructions: readText(values, 'instructions') ?? '' },
    select: { instructions: true },
  })

  return row.instructions
}

/**
 * Drop a session
 * @param {string} id - Session identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<void>} - Dropped
 */

export const removeSession = async (id: string, scope: AccessScope): Promise<void> => {
  await reachableSession(id, scope)
  await prisma.recruitmentSession.delete({ where: { id } })
}

// Relations every candidate read carries
const CANDIDATE_INCLUDE = {
  recruiter: true,
  spectators: { include: { account: true } },
  comments: { orderBy: { createdAt: 'desc' }, include: { author: true } },
} as const

/**
 * Read one candidate back with the moderator its Discord identifier resolves to
 * @param {string} id - Candidate identifier
 * @return {Promise<CandidateView>} - Candidate card
 */

const readCandidate = async (id: string): Promise<CandidateView> => {
  const row = await prisma.recruitmentCandidate.findUniqueOrThrow({
    where: { id },
    include: CANDIDATE_INCLUDE,
  })

  const member = await prisma.account.findUnique({
    where: { discordId: row.discordId },
    select: { id: true, discordId: true, displayName: true },
  })

  return toCandidate(row, new Map(member ? [[member.discordId, member]] : []))
}

/**
 * Read the outcome a new candidate lands in
 * @return {Promise<string | null>} - Outcome identifier
 */

const defaultOutcome = async (): Promise<string | null> => {
  const outcome =
    (await prisma.recruitmentOutcome.findFirst({ where: { archived: false, isDefault: true } })) ??
    (await prisma.recruitmentOutcome.findFirst({
      where: { archived: false },
      orderBy: { position: 'asc' },
    }))

  return outcome?.id ?? null
}

/**
 * Add a candidate to a session
 * @param {string} sessionId - Session identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<CandidateView>} - Candidate card
 */

export const createCandidate = async (
  sessionId: string,
  values: FormValues,
  scope: AccessScope
): Promise<CandidateView> => {
  await reachableSession(sessionId, scope)

  const spectatorIds = readList(values, 'spectatorIds')
  const last = await prisma.recruitmentCandidate.findFirst({
    where: { sessionId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })

  const row = await prisma.recruitmentCandidate
    .create({
      data: {
        sessionId,
        discordId: readText(values, 'discordId') ?? '',
        formId: readText(values, 'formId'),
        recruiterId: readText(values, 'recruiterId'),
        outcomeId: readText(values, 'outcomeId') ?? (await defaultOutcome()),
        interviewAt: readDate(values, 'interviewAt'),
        attended: readFlag(values, 'attended'),
        position: (last?.position ?? 0) + FORM_SETTINGS.positionStep,
        spectators: { create: spectatorIds.map((accountId) => ({ accountId })) },
      },
    })
    .catch(rethrow)

  return readCandidate(row.id)
}

/**
 * Edit a candidate
 * @param {string} id - Candidate identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<CandidateView>} - Candidate card
 */

export const updateCandidate = async (
  id: string,
  values: FormValues,
  scope: AccessScope
): Promise<CandidateView> => {
  await reachableCandidate(id, scope)

  const spectatorIds = readList(values, 'spectatorIds')

  await prisma.recruitmentCandidate
    .update({
      where: { id },
      data: {
        discordId: readText(values, 'discordId') ?? undefined,
        formId: readText(values, 'formId'),
        recruiterId: readText(values, 'recruiterId'),
        outcomeId: readText(values, 'outcomeId'),
        interviewAt: readDate(values, 'interviewAt'),
        attended: readFlag(values, 'attended'),
        // The seats are replaced wholesale, the form always ships them in full
        spectators: {
          deleteMany: {},
          create: spectatorIds.map((accountId) => ({ accountId })),
        },
      },
    })
    .catch(rethrow)

  return readCandidate(id)
}

/**
 * Write the bilan of a candidate
 * @param {string} id - Candidate identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<CandidateView>} - Candidate card
 */

export const saveReview = async (
  id: string,
  values: FormValues,
  scope: AccessScope
): Promise<CandidateView> => {
  await reachableCandidate(id, scope)

  await prisma.recruitmentCandidate.update({
    where: { id },
    data: { review: readText(values, 'review') ?? '' },
  })

  return readCandidate(id)
}

/**
 * Move a candidate into an outcome column
 * @param {string} id - Candidate identifier
 * @param {string} outcomeId - Column dropped into
 * @param {number} index - Drop index
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<CandidateView>} - Candidate card
 */

export const moveCandidate = async (
  id: string,
  outcomeId: string,
  index: number,
  scope: AccessScope
): Promise<CandidateView> => {
  const sessionId = await reachableCandidate(id, scope)

  const column = await prisma.recruitmentCandidate.findMany({
    where: { sessionId, outcomeId, id: { not: id } },
    orderBy: { position: 'asc' },
    select: { id: true, position: true },
  })

  await prisma.recruitmentCandidate.update({
    where: { id },
    data: { outcomeId, position: positionAt(column, index) },
  })

  return readCandidate(id)
}

/**
 * Drop a candidate
 * @param {string} id - Candidate identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<void>} - Dropped
 */

export const removeCandidate = async (id: string, scope: AccessScope): Promise<void> => {
  await reachableCandidate(id, scope)
  await prisma.recruitmentCandidate.delete({ where: { id } })
}

/**
 * Leave a remark on a candidate
 * @param {string} candidateId - Candidate identifier
 * @param {FormValues} values - Parsed body
 * @param {string} authorId - Who writes it
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<CandidateView>} - Candidate card
 */

export const addComment = async (
  candidateId: string,
  values: FormValues,
  authorId: string,
  scope: AccessScope
): Promise<CandidateView> => {
  await reachableCandidate(candidateId, scope)

  await prisma.recruitmentComment.create({
    data: { candidateId, authorId, body: encryptField(readText(values, 'body')) ?? '' },
  })

  return readCandidate(candidateId)
}

/**
 * Read the session an application belongs to
 * @param {string} candidateId - Candidate identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<string>} - Session identifier
 */

export const candidateSession = (candidateId: string, scope: AccessScope): Promise<string> =>
  reachableCandidate(candidateId, scope)

/**
 * Drop a remark
 * @param {string} id - Comment identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<CandidateView>} - Candidate card
 */

export const removeComment = async (id: string, scope: AccessScope): Promise<CandidateView> => {
  const row = await prisma.recruitmentComment.findFirst({
    where: { AND: [{ id }, { candidate: { session: sessionScope(scope) } }] },
    select: { candidateId: true },
  })

  if (!row) throw notFound()

  await prisma.recruitmentComment.delete({ where: { id } })

  return readCandidate(row.candidateId)
}

/**
 * Map a step row to the shape the timeline renders
 * @param {object} row - Step row
 * @return {RecruitmentStepView} - Timeline moment
 */

const toStep = (row: {
  id: string
  title: string
  notes: string | null
  owner: RecruitmentOwnerName
  offset: number
  scheduledAt: Date | null
  doneAt: Date | null
  required: boolean
  position: number
}): RecruitmentStepView => ({
  id: row.id,
  title: row.title,
  notes: row.notes,
  owner: row.owner,
  offset: row.offset,
  scheduledAt: row.scheduledAt?.toISOString() ?? null,
  doneAt: row.doneAt?.toISOString() ?? null,
  required: row.required,
  position: row.position,
})

/**
 * Add a step to a session timeline
 * @param {string} sessionId - Session identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<RecruitmentStepView>} - Timeline moment
 */

export const createStep = async (
  sessionId: string,
  values: FormValues,
  scope: AccessScope
): Promise<RecruitmentStepView> => {
  const session = await reachableSession(sessionId, scope)
  const offset = readNumberValue(values, 'offset') ?? 0
  const scheduledAt = readDate(values, 'scheduledAt')

  const last = await prisma.recruitmentStep.findFirst({
    where: { sessionId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })

  const row = await prisma.recruitmentStep.create({
    data: {
      sessionId,
      title: readText(values, 'title') ?? '',
      notes: readText(values, 'notes'),
      owner: (readText(values, 'owner') ?? RecruitmentOwners.Responsable) as RecruitmentOwnerName,
      offset,
      // An explicit day wins, otherwise the offset resolves against the opening
      scheduledAt:
        scheduledAt ??
        (session.opensAt ? new Date(session.opensAt.getTime() + offset * DAY_IN_MS) : null),
      required: readFlag(values, 'required'),
      position: (last?.position ?? 0) + FORM_SETTINGS.positionStep,
    },
  })

  return toStep(row)
}

/**
 * Read the session a step belongs to, guarding the perimeter
 * @param {string} stepId - Step identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<void>} - Throws when out of perimeter
 */

const reachableStep = async (stepId: string, scope: AccessScope): Promise<void> => {
  const row = await prisma.recruitmentStep.findFirst({
    where: { AND: [{ id: stepId }, { session: sessionScope(scope) }] },
    select: { id: true },
  })

  if (!row) throw notFound()
}

/**
 * Edit a timeline step
 * @param {string} id - Step identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<RecruitmentStepView>} - Timeline moment
 */

export const updateStep = async (
  id: string,
  values: FormValues,
  scope: AccessScope
): Promise<RecruitmentStepView> => {
  await reachableStep(id, scope)

  const row = await prisma.recruitmentStep.update({
    where: { id },
    data: {
      title: readText(values, 'title') ?? undefined,
      notes: readText(values, 'notes'),
      owner: (readText(values, 'owner') ?? undefined) as RecruitmentOwnerName | undefined,
      offset: readNumberValue(values, 'offset') ?? undefined,
      scheduledAt: readDate(values, 'scheduledAt'),
      required: readFlag(values, 'required'),
    },
  })

  return toStep(row)
}

/**
 * Clear or reopen a timeline step
 * @param {string} id - Step identifier
 * @param {boolean} done - Cleared
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<RecruitmentStepView>} - Timeline moment
 */

export const setStepDone = async (
  id: string,
  done: boolean,
  scope: AccessScope
): Promise<RecruitmentStepView> => {
  await reachableStep(id, scope)

  const row = await prisma.recruitmentStep.update({
    where: { id },
    data: { doneAt: done ? new Date() : null },
  })

  return toStep(row)
}

/**
 * Drop a timeline step
 * @param {string} id - Step identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<void>} - Dropped
 */

export const removeStep = async (id: string, scope: AccessScope): Promise<void> => {
  await reachableStep(id, scope)
  await prisma.recruitmentStep.delete({ where: { id } })
}

/**
 * Read the recruitment file a moderator's Discord identifier resolves to
 * @param {string} discordId - Discord identifier of the moderator
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<{ sessionId: string, candidateId: string } | null>} - Where the file lives
 */

export const findCandidateFile = async (
  discordId: string,
  scope: AccessScope
): Promise<{ sessionId: string; candidateId: string } | null> => {
  const row = await prisma.recruitmentCandidate.findFirst({
    where: { AND: [{ discordId }, { session: sessionScope(scope) }] },
    orderBy: { createdAt: 'desc' },
    select: { id: true, sessionId: true },
  })

  return row ? { sessionId: row.sessionId, candidateId: row.id } : null
}
