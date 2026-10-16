import 'server-only'

import crypto from 'crypto'
import { prisma } from '@/core/lib/db'
import { OPEN_SCOPE } from '@/core/services/academy/AcademyScope'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { WEEK_GRID_DAYS, addDays, startOfDay } from '@/utils/format/days'
import { conflict, notFound } from '@/core/lib/errors'
import { readDateRange, readList, readText } from '@/core/lib/forms/values'
import { milestoneIndex } from '@/core/lib/academy/parkourTimeline'
import type { ParkourPhase } from '@/core/lib/academy/parkour'
import { resolveBoth } from '@/core/services/academy/parkour/phases'
import { assertRecruitmentOver } from '@/core/services/academy/recruitmentGate'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { PARKOUR_COPY } from '@/declarations/academy/parkour'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import type { SessionDetail, SessionSummary } from '@/types/academy'
import type { FormValues } from '@/types/forms'
import {
  AcademyJuniorStatuses,
  AcademySessionStatuses,
  AcademyStages,
} from '@/utils/constants/hierarchy'
import type { AcademySessionStatusName } from '@/utils/constants/hierarchy'
import { IntegrationLinkKinds } from '@/utils/constants/integration'
import { listJuniors } from '@/core/services/academy/juniors/JuniorService'
import { sessionInScope } from '@/core/services/academy/lookups'
import { SESSION_SHAPE, sessionNumbers, toSummary } from '@/core/services/academy/sessionView'

/**
 * Phase of every junior of the given sessions, furthest along first
 * @param {string[]} sessionIds - Session identifiers
 * @return {Promise<Map<string, ParkourPhase[]>>} - Phases by session
 */

const sessionPhases = async (sessionIds: string[]): Promise<Map<string, ParkourPhase[]>> => {
  const rows = await prisma.academyJunior.findMany({
    where: { sessionId: { in: sessionIds } },
    include: {
      reviews: { select: { stage: true, status: true } },
      session: { select: { status: true, secondPeriodAt: true } },
    },
  })

  const byRank = (left: ParkourPhase, right: ParkourPhase) =>
    milestoneIndex(right) - milestoneIndex(left)

  return new Map(
    Object.entries(Object.groupBy(rows, (row) => row.sessionId)).map(([sessionId, seats]) => [
      sessionId,
      (seats ?? []).map((seat) => resolveBoth(seat, seat.session).phase).sort(byRank),
    ])
  )
}

/**
 * Read every session within scope
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<SessionSummary[]>} - Sessions
 */

export const listSessions = async (scope: AcademyScope): Promise<SessionSummary[]> => {
  const rows = await prisma.academySession.findMany({
    where: { ...scope.session, status: { not: AcademySessionStatuses.Archived } },
    include: SESSION_SHAPE,
    orderBy: { startsAt: 'desc' },
  })

  const numbers = await sessionNumbers()

  const phases = await sessionPhases(rows.map((row) => row.id))

  return rows.map((row) => toSummary(numbers, row, phases.get(row.id)))
}

/**
 * Shortest run a session may last
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
  const [startsAt, endsAt] = readDateRange(values, 'period') ?? [new Date()]

  return {
    functionId: readText(values, 'functionId') ?? '',
    status: (readText(values, 'status') ??
      AcademySessionStatuses.Draft) as AcademySessionStatusName,
    startsAt,
    // An unset end date lands on the shortest run the settings allow
    endsAt: endsAt ?? proposedEnd(startsAt),
  }
}

/**
 * Open the integration link of a session once it starts taking applications
 * @param {string} sessionId - Session identifier
 * @param {AcademySessionStatusName} status - Status the session was just set to
 * @return {Promise<void>} - Applied
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

  await ensureSessionInvite(row.id, row.status)

  return listSessions(OPEN_SCOPE)
}

/**
 * Edit a session
 * @param {string} id - Session identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {FormValues} values - Parsed body
 * @return {Promise<SessionSummary[]>} - Sessions
 */

export const updateSession = async (
  id: string,
  scope: AcademyScope,
  values: FormValues
): Promise<SessionSummary[]> => {
  const previous = await sessionInScope(id, scope)
  const data = toSessionData(values)
  const launching =
    data.status === AcademySessionStatuses.Running &&
    previous.status !== AcademySessionStatuses.Running

  if (launching) await ensureLaunchable(id)

  // The trainer seats are replaced wholesale
  await prisma.$transaction([
    prisma.academySession.update({ where: { id }, data }),
    prisma.academySessionTrainer.deleteMany({ where: { sessionId: id } }),
    prisma.academySessionTrainer.createMany({
      data: readList(values, 'trainerIds').map((accountId) => ({ sessionId: id, accountId })),
    }),
  ])

  await ensureSessionInvite(id, data.status)
  if (launching) await launchSession(id)

  return listSessions(scope)
}

/**
 * Start a promotion
 * @param {string} id - Session identifier
 * @return {Promise<void>} - Launched
 */

export const launchPromotion = async (id: string): Promise<void> => {
  await prisma.academySession.update({
    where: { id },
    data: { status: AcademySessionStatuses.Running },
  })
  await launchSession(id)
}

/**
 * Refuse to launch a promotion while a confirmed junior still has no Formateur
 * @param {string} id - Session identifier
 * @return {Promise<void>} - Throws when a trainer is missing
 */

const ensureLaunchable = async (id: string): Promise<void> => {
  await assertRecruitmentOver(id)

  const orphans = await prisma.academyJunior.count({
    where: {
      sessionId: id,
      status: AcademyJuniorStatuses.Active,
      confirmedAt: { not: null },
      trainerId: null,
    },
  })

  if (orphans > 0) throw conflict(ACADEMY_COPY.launchMissingTrainer)

  // Nobody ready means nothing to launch
  const ready = await prisma.academyJunior.count({
    where: { sessionId: id, status: AcademyJuniorStatuses.Active, confirmedAt: { not: null } },
  })
  if (ready === 0) throw conflict(PARKOUR_COPY.launchNobodyReady)
}

/**
 * Start a promotion for real: its day starts now
 * @param {string} id - Session identifier
 * @return {Promise<void>} - Launched
 */

const launchSession = async (id: string): Promise<void> => {
  const startsAt = startOfDay(new Date())

  await prisma.$transaction([
    prisma.academySession.update({ where: { id }, data: { startsAt } }),
    // Only the seats whose form came back leave
    prisma.academyJunior.updateMany({
      where: {
        sessionId: id,
        stage: AcademyStages.Preparation,
        status: AcademyJuniorStatuses.Active,
        confirmedAt: { not: null },
      },
      data: { stage: AcademyStages.Discovery, startedAt: startsAt },
    }),
  ])
}

/**
 * Close and drop a session
 * @param {string} id - Session identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<SessionSummary[]>} - Sessions
 */

export const removeSession = async (id: string, scope: AcademyScope): Promise<SessionSummary[]> => {
  await sessionInScope(id, scope)
  await prisma.academySession.delete({ where: { id } })

  return listSessions(scope)
}

/**
 * Read one whole session within scope
 * @param {string} id - Session identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<SessionDetail>} - Session detail
 */

export const readSession = async (id: string, scope: AcademyScope): Promise<SessionDetail> => {
  const row = await prisma.academySession.findFirst({
    where: { id, ...scope.session },
    include: SESSION_SHAPE,
  })
  if (!row) throw notFound()

  const juniors = await listJuniors(id, row.functionId, scope)

  return {
    summary: toSummary(
      await sessionNumbers(),
      row,
      juniors.map((junior) => junior.phase)
    ),
    juniors,
  }
}
