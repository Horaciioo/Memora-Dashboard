import 'server-only'

import { presenceOutcome, tallyPresences } from '@/core/lib/academy/presences'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { absenceDay } from '@/core/services/absences/AbsenceService'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import type { JuniorLiveView, PresenceTally } from '@/types/academy'
import { LiveStatuses } from '@/utils/constants/lives'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import type { AttendanceStatusName } from '@/utils/constants/workflow'

// Lives of a period: announced or held, never cancelled
const periodLives = (from: Date, to: Date) => ({
  status: { not: LiveStatuses.Cancelled },
  plannedStartAt: { gte: from, lte: to },
})

/**
 * Proof of presence and leave of some members over some lives
 * @param {string[]} accountIds - Members
 * @param {string[]} liveIds - Lives
 * @param {Date} from - Start of the window
 * @return {Promise<{ moderated: Set<string>, leave: Map<string, { start: number, end: number }[]> }>} - Gestures and leave
 */

const readSignals = async (accountIds: string[], liveIds: string[], from: Date) => {
  const [gestures, stints, absences] = await Promise.all([
    prisma.moderationAction.findMany({
      where: {
        liveId: { in: liveIds },
        actorAccountId: { in: accountIds },
        status: 'SUCCEEDED',
      },
      select: { liveId: true, actorAccountId: true },
      distinct: ['liveId', 'actorAccountId'],
    }),
    prisma.liveModStint.findMany({
      where: { liveId: { in: liveIds }, accountId: { in: accountIds } },
      select: { liveId: true, accountId: true },
      distinct: ['liveId', 'accountId'],
    }),
    prisma.absence.findMany({
      where: {
        accountId: { in: accountIds },
        status: AbsenceStatuses.Approved,
        endDate: { gte: absenceDay(from) },
      },
      select: { accountId: true, startDate: true, endDate: true },
    }),
  ])

  const leave = new Map<string, { start: number; end: number }[]>()
  absences.forEach((row) =>
    leave.set(row.accountId, [
      ...(leave.get(row.accountId) ?? []),
      { start: +row.startDate, end: +row.endDate },
    ])
  )

  return {
    moderated: new Set([
      ...gestures.map((row) => `${row.liveId}:${row.actorAccountId}`),
      ...stints.map((row) => `${row.liveId}:${row.accountId}`),
    ]),
    leave,
  }
}

type Signals = Awaited<ReturnType<typeof readSignals>>

/**
 * Outcome of one live for one member
 * @param {Signals} signals - Gestures and leave
 * @param {{ liveId: string, accountId: string, startsAt: Date, attendance: AttendanceStatusName | null }} live - Live and answer
 * @return {PresenceOutcomeName} - Outcome
 */

const outcomeOf = (
  signals: Signals,
  live: {
    liveId: string
    accountId: string
    startsAt: Date
    attendance: AttendanceStatusName | null
  }
) => {
  const day = +absenceDay(live.startsAt)

  return presenceOutcome({
    attendance: live.attendance,
    moderated: signals.moderated.has(`${live.liveId}:${live.accountId}`),
    onLeave: (signals.leave.get(live.accountId) ?? []).some(
      (range) => range.start <= day && day <= range.end
    ),
  })
}

/**
 * Every live of a junior's period with what they said about it
 * @param {string} juniorId - Junior seat
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<JuniorLiveView[]>} - Lives of the period, newest first
 */

export const juniorLives = async (
  juniorId: string,
  scope: AcademyScope
): Promise<JuniorLiveView[]> => {
  const junior = await prisma.academyJunior.findFirst({
    where: { id: juniorId, session: scope.session, ...scope.juniors },
    select: { accountId: true, startedAt: true, leftAt: true },
  })
  if (!junior) throw notFound()

  const rows = await prisma.live.findMany({
    where: periodLives(junior.startedAt, junior.leftAt ?? new Date()),
    select: {
      id: true,
      title: true,
      platform: true,
      plannedStartAt: true,
      startedAt: true,
      youtuber: { select: { name: true } },
      calendarEvent: {
        select: {
          attendances: {
            where: { accountId: junior.accountId },
            select: { status: true, availableFrom: true, availableTo: true },
          },
        },
      },
    },
    orderBy: { plannedStartAt: 'desc' },
    take: ACADEMY_SETTINGS.juniorLivesLimit,
  })

  const signals = await readSignals(
    [junior.accountId],
    rows.map((row) => row.id),
    junior.startedAt
  )

  return rows.map((row) => {
    const answer = row.calendarEvent?.attendances[0]
    const startsAt = row.startedAt ?? row.plannedStartAt

    return {
      liveId: row.id,
      title: row.title,
      creator: row.youtuber.name,
      platform: row.platform,
      startsAt: startsAt.toISOString(),
      outcome: outcomeOf(signals, {
        liveId: row.id,
        accountId: junior.accountId,
        startsAt,
        attendance: (answer?.status as AttendanceStatusName | undefined) ?? null,
      }),
      availableFrom: answer?.availableFrom?.toISOString() ?? null,
      availableTo: answer?.availableTo?.toISOString() ?? null,
    }
  })
}

/**
 * Present, absent and silent lives of each junior of a session
 * @param {string} sessionId - Session identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<PresenceTally[]>} - One tally per running or finished junior
 */

export const sessionPresences = async (
  sessionId: string,
  scope: AcademyScope
): Promise<PresenceTally[]> => {
  const juniors = await prisma.academyJunior.findMany({
    where: {
      sessionId,
      session: scope.session,
      ...scope.juniors,
    },
    select: { id: true, accountId: true, startedAt: true, leftAt: true },
  })
  if (juniors.length === 0) return []

  const now = new Date()
  const earliest = new Date(Math.min(...juniors.map((junior) => junior.startedAt.getTime())))
  const accountIds = juniors.map((junior) => junior.accountId)
  const lives = await prisma.live.findMany({
    where: periodLives(earliest, now),
    select: {
      id: true,
      plannedStartAt: true,
      calendarEvent: {
        select: {
          attendances: {
            where: { accountId: { in: accountIds } },
            select: { accountId: true, status: true },
          },
        },
      },
    },
  })
  const signals = await readSignals(
    accountIds,
    lives.map((live) => live.id),
    earliest
  )

  return juniors.map((junior) => {
    const to = junior.leftAt ?? now

    return tallyPresences(
      junior.id,
      lives
        .filter((live) => live.plannedStartAt >= junior.startedAt && live.plannedStartAt <= to)
        .map((live) =>
          outcomeOf(signals, {
            liveId: live.id,
            accountId: junior.accountId,
            startsAt: live.plannedStartAt,
            attendance:
              (live.calendarEvent?.attendances.find((row) => row.accountId === junior.accountId)
                ?.status as AttendanceStatusName | undefined) ?? null,
          })
        )
    )
  })
}
