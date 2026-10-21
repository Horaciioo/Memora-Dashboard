import 'server-only'

import { prisma } from '@/core/lib/db'
import { foldStints, windowFit } from '@/core/lib/lives/stints'
import type { StintRow } from '@/core/lib/lives/stints'
import {
  LIVE_FUNCTIONS,
  LIVE_OUTSIDE_DEFAULT,
  LIVE_OUTSIDE_LABELS,
} from '@/declarations/lives/registries'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import type { LiveModTime, LiveSpan } from '@/types/lives'
import { LEADERSHIP_ROLES } from '@/utils/constants/hierarchy'
import { LiveStatuses } from '@/utils/constants/lives'
import { AttendanceStatuses } from '@/utils/constants/workflow'

// Roles that supervise lives
const LEAD_ROLES: string[] = LEADERSHIP_ROLES

/**
 * Open a stretch unless one already runs
 * @param {string} liveId - Live
 * @param {string} accountId - Member
 * @return {Promise<void>} - Opened
 */

export const ensureStint = async (liveId: string, accountId: string): Promise<void> => {
  const open = await prisma.liveModStint.findFirst({
    where: { liveId, accountId, stoppedAt: null },
    select: { id: true },
  })
  if (open) return

  await prisma.liveModStint.create({ data: { liveId, accountId } })
}

/**
 * End the stretch of a member who stops moderating
 * @param {string} liveId - Live
 * @param {string} accountId - Member
 * @return {Promise<void>} - Stopped
 */

export const stopStint = async (liveId: string, accountId: string): Promise<void> => {
  await prisma.liveModStint.updateMany({
    where: { liveId, accountId, stoppedAt: null },
    data: { stoppedAt: new Date() },
  })
}

/**
 * End the stretch of a member at the moment they left the Mod View
 * @param {string} liveId - Live
 * @param {string} accountId - Member
 * @param {Date} at - When they left
 * @return {Promise<void>} - Stopped
 */

export const stopStintAt = async (liveId: string, accountId: string, at: Date): Promise<void> => {
  const open = await prisma.liveModStint.findMany({
    where: { liveId, accountId, stoppedAt: null },
    select: { id: true, startedAt: true },
  })

  // A stretch never ends before it began
  await Promise.all(
    open.map((stint) =>
      prisma.liveModStint.update({
        where: { id: stint.id },
        data: { stoppedAt: new Date(Math.max(+stint.startedAt, +at)) },
      })
    )
  )
}

/**
 * End every stretch of a live that closed: a member who left the Mod View before the end stops
 * where they left, not when the live ended
 * @param {string} liveId - Live
 * @return {Promise<void>} - Closed
 */

export const closeLiveStints = async (liveId: string): Promise<void> => {
  const now = new Date()
  const open = await prisma.liveModStint.findMany({
    where: { liveId, stoppedAt: null },
    select: { accountId: true },
    distinct: ['accountId'],
  })

  for (const { accountId } of open) {
    const last = await prisma.modViewPresence.findFirst({
      where: { liveId, accountId },
      orderBy: { lastBeatAt: 'desc' },
      select: { lastBeatAt: true },
    })
    const isGone = last !== null && +now - +last.lastBeatAt > LIVE_SETTINGS.staleSeconds * 1000

    await stopStintAt(liveId, accountId, isGone && last ? last.lastBeatAt : now)
  }
}

/**
 * Fold one member's stretches of a live against the hours they gave
 * @param {Object} input - Stretches and hours
 * @param {StintRow[]} input.rows - Stretches
 * @param {{ from: Date, to: Date } | null} input.declared - Hours given
 * @param {Date} input.cap - End given to a stretch still open
 * @param {boolean} input.isClosed - The live is over
 * @return {LiveSpan | null} - Span, none when nothing to say
 */

const toSpan = ({
  rows,
  declared,
  cap,
  isClosed,
}: {
  rows: StintRow[]
  declared: { from: Date; to: Date } | null
  cap: Date
  isClosed: boolean
}): LiveSpan | null => {
  const [total] = foldStints(rows, cap)
  if (!total && !declared) return null

  const fit = declared ? windowFit(rows, cap, declared) : null
  // Hours still to come are not missed yet
  const isAbsent = declared !== null && fit?.inside === 0 && (isClosed || +cap >= +declared.to)
  const shown = total ?? { seconds: 0, from: declared!.from, to: declared!.to }

  return {
    seconds: shown.seconds,
    from: shown.from.toISOString(),
    to: shown.to.toISOString(),
    declared: declared
      ? { from: declared.from.toISOString(), to: declared.to.toISOString() }
      : null,
    isAbsent,
    extraSeconds: fit?.outside ?? 0,
  }
}

/**
 * Hours given with a Present, by member
 * @param {{ accountId: string, availableFrom: Date | null, availableTo: Date | null }[]} seats - Roll-call rows
 * @return {Map<string, { from: Date, to: Date }>} - Hours per member
 */

const declaredHours = (
  seats: { accountId: string; availableFrom: Date | null; availableTo: Date | null }[]
): Map<string, { from: Date; to: Date }> =>
  new Map(
    seats.flatMap((seat) =>
      seat.availableFrom && seat.availableTo
        ? [[seat.accountId, { from: seat.availableFrom, to: seat.availableTo }] as const]
        : []
    )
  )

/**
 * Where a moderator comes from when not the Live team: Discord, or elsewhere
 * @param {Object} account - Member
 * @param {string} account.role - Role
 * @param {{ jobFunction: { name: string } }[]} account.functions - Functions held
 * @return {string | null} - Label, none for the team and the Responsables
 */

const outsideLabel = (account: {
  role: string
  functions: { jobFunction: { name: string } }[]
}): string | null => {
  const names = account.functions.map((row) => row.jobFunction.name)
  if (names.some((name) => LIVE_FUNCTIONS.includes(name))) return null
  if (LEAD_ROLES.includes(account.role)) return null

  const known = names.find((name) => name in LIVE_OUTSIDE_LABELS)

  return known ? LIVE_OUTSIDE_LABELS[known] : LIVE_OUTSIDE_DEFAULT
}

/**
 * Who moderated a live and for how long, with those who gave hours and never came
 * @param {string} liveId - Live
 * @param {Date} cap - End given to a stretch still open
 * @param {boolean} isClosed - The live is over
 * @return {Promise<LiveModTime[]>} - Team, earliest start first
 */

export const readLiveTeam = async (
  liveId: string,
  cap: Date,
  isClosed: boolean
): Promise<LiveModTime[]> => {
  const [rows, seats] = await Promise.all([
    prisma.liveModStint.findMany({
      where: { liveId },
      select: { accountId: true, startedAt: true, stoppedAt: true },
    }),
    prisma.eventAttendance.findMany({
      where: {
        status: AttendanceStatuses.Present,
        availableFrom: { not: null },
        event: { live: { id: liveId } },
      },
      select: { accountId: true, availableFrom: true, availableTo: true },
    }),
  ])
  const hours = declaredHours(seats)
  const byAccount = Map.groupBy(rows, (row) => row.accountId)
  const ids = [...new Set([...byAccount.keys(), ...hours.keys()])]

  const [accounts, calls] = await Promise.all([
    prisma.account.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        functions: { select: { jobFunction: { select: { name: true } } } },
      },
    }),
    prisma.liveMember.findMany({
      where: { liveId, reinforcement: true, accountId: { in: ids } },
      select: { accountId: true, requestedById: true },
    }),
  ])
  const requesters = await prisma.account.findMany({
    where: {
      id: { in: calls.flatMap((call) => (call.requestedById ? [call.requestedById] : [])) },
    },
    select: { id: true, displayName: true },
  })

  return ids
    .flatMap((accountId) => {
      const account = accounts.find((row) => row.id === accountId)
      const span = toSpan({
        rows: byAccount.get(accountId) ?? [],
        declared: hours.get(accountId) ?? null,
        cap,
        isClosed,
      })

      if (!account || !span) return []

      const call = calls.find((row) => row.accountId === accountId)

      return [
        {
          accountId,
          name: account.displayName,
          avatar: account.avatarUrl,
          outside: outsideLabel(account),
          reinforcement: call
            ? {
                requestedBy:
                  requesters.find((row) => row.id === call.requestedById)?.displayName ?? null,
              }
            : null,
          ...span,
        },
      ]
    })
    .sort((left, right) => Date.parse(left.from) - Date.parse(right.from))
}

/**
 * Moderation time of one member on each live, hours given included
 * @param {string} accountId - Member
 * @param {string[]} liveIds - Lives already known
 * @return {Promise<Map<string, LiveSpan>>} - Span per live, lives of missed hours too
 */

export const readMemberSpans = async (
  accountId: string,
  liveIds: string[]
): Promise<Map<string, LiveSpan>> => {
  // Lives where they gave hours, once those lives started
  const seats = await prisma.eventAttendance.findMany({
    where: {
      accountId,
      status: AttendanceStatuses.Present,
      availableFrom: { not: null },
      event: { live: { status: { in: [LiveStatuses.Live, LiveStatuses.Ended] } } },
    },
    select: {
      accountId: true,
      availableFrom: true,
      availableTo: true,
      event: { select: { live: { select: { id: true, status: true } } } },
    },
    orderBy: { availableFrom: 'desc' },
    take: 60,
  })
  const given = new Map(
    seats.flatMap((seat) => (seat.event.live ? [[seat.event.live.id, seat] as const] : []))
  )
  const ids = [...new Set([...liveIds, ...given.keys()])]

  const rows = await prisma.liveModStint.findMany({
    where: { accountId, liveId: { in: ids } },
    select: { liveId: true, accountId: true, startedAt: true, stoppedAt: true },
  })
  const byLive = Map.groupBy(rows, (row) => row.liveId)

  return new Map(
    ids.flatMap((liveId) => {
      const seat = given.get(liveId)
      const span = toSpan({
        rows: byLive.get(liveId) ?? [],
        declared: seat ? (declaredHours([seat]).get(accountId) ?? null) : null,
        cap: new Date(),
        isClosed: seat?.event.live?.status === LiveStatuses.Ended,
      })

      return span ? [[liveId, span] as const] : []
    })
  )
}
