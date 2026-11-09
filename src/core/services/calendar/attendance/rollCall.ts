import 'server-only'
import { prisma } from '@/core/lib/db'
import { conflict, forbidden, notFound } from '@/core/lib/errors'
import { isOpenLive } from '@/core/lib/lives/permissions'
import { syncJuniorLives } from '@/core/services/academy/parkour/LiveCountService'
import type { AttendanceRoster } from '@/types/calendar'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { AttendanceStatusName } from '@/utils/constants/workflow'
import type { LiveStatusName } from '@/utils/constants/lives'
import {
  eventsAskingHours,
  keepHours,
  readRosterFor,
} from '@/core/services/calendar/attendance/roster'

/**
 * Record one member's answer to a roll-call
 * @param {Object} input - Answer
 * @param {string} input.eventId - Roll-call event
 * @param {string} input.accountId - Answering member
 * @param {AttendanceStatusName} input.status - Present or absent
 * @param {boolean} input.canManage - Answerer also runs the roll-call
 * @param {{ from: Date, to: Date } | null} [input.hours] - Hours expected to be there
 * @return {Promise<AttendanceRoster>} - Refreshed standings
 */

export const respondToRollCall = async ({
  eventId,
  accountId,
  status,
  canManage,
  hours = null,
}: {
  eventId: string
  accountId: string
  status: AttendanceStatusName
  canManage: boolean
  hours?: { from: Date; to: Date } | null
}): Promise<AttendanceRoster> => {
  // Only a convened member holds a row to answer with
  const row = await prisma.eventAttendance.findUnique({
    where: { eventId_accountId: { eventId, accountId } },
  })
  if (!row) throw forbidden()

  // A closed live keeps its answers
  const live = await prisma.live.findUnique({
    where: { calendarEventId: eventId },
    select: { status: true },
  })
  if (live && !canManage && !isOpenLive(live.status as LiveStatusName)) throw conflict()

  // Hours only follow a Present on a live
  const asking = await eventsAskingHours([eventId])
  const kept =
    status === AttendanceStatuses.Present && asking.has(eventId) ? keepHours(hours) : null

  await prisma.eventAttendance.update({
    where: { id: row.id },
    data: {
      status,
      respondedAt: new Date(),
      availableFrom: kept?.from ?? null,
      availableTo: kept?.to ?? null,
    },
  })

  // An answer on a past live moves a junior's count
  await syncJuniorLives([accountId])

  return readRosterFor(eventId, accountId, canManage)
}

/**
 * Move one convened member to a column, as the one running the roll-call
 * @param {string} eventId - Roll-call event
 * @param {string} accountId - Member moved
 * @param {AttendanceStatusName} status - Column dropped on
 * @param {string} viewerId - Signed-in member
 * @return {Promise<AttendanceRoster>} - Refreshed standings
 */

export const moveOnRollCall = async (
  eventId: string,
  accountId: string,
  status: AttendanceStatusName,
  viewerId: string
): Promise<AttendanceRoster> => {
  const row = await prisma.eventAttendance.findUnique({
    where: { eventId_accountId: { eventId, accountId } },
  })
  if (!row) throw notFound()

  await prisma.eventAttendance.update({
    where: { id: row.id },
    data: {
      status,
      respondedAt: row.respondedAt ?? new Date(),
      ...(status !== AttendanceStatuses.Present && { availableFrom: null, availableTo: null }),
    },
  })

  await syncJuniorLives([accountId])

  return readRosterFor(eventId, viewerId, true)
}

/**
 * One roll-call awaiting the signed-in member's answer
 * @typedef {Object} PendingRollCall
 * @property {string} eventId - Event identifier
 * @property {string} title - Event title
 * @property {string | null} emoji - Event glyph
 * @property {string} startsAt - ISO start
 * @property {string | null} endsAt - ISO end
 * @property {AttendanceStatusName} status - Member's current answer
 * @property {boolean} asksHours - A live asks for hours
 */

export interface PendingRollCall {
  eventId: string
  title: string
  emoji: string | null
  startsAt: string
  endsAt: string | null
  status: AttendanceStatusName
  asksHours: boolean
}

/**
 * Read the roll-calls still waiting on one member
 * @param {string} accountId - Signed-in member
 * @return {Promise<PendingRollCall[]>} - Upcoming roll-calls
 */

export const myRollCalls = async (accountId: string): Promise<PendingRollCall[]> => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const rows = await prisma.eventAttendance.findMany({
    // Only the ones still waiting on an answer
    where: {
      accountId,
      status: AttendanceStatuses.Pending,
      event: { rollCall: true, startsAt: { gte: start } },
    },
    include: {
      event: { select: { id: true, title: true, emoji: true, startsAt: true, endsAt: true } },
    },
    orderBy: { event: { startsAt: 'asc' } },
  })

  const asking = await eventsAskingHours(rows.map((row) => row.event.id))

  return rows.map((row) => ({
    eventId: row.event.id,
    title: row.event.title,
    emoji: row.event.emoji,
    startsAt: row.event.startsAt.toISOString(),
    endsAt: row.event.endsAt?.toISOString() ?? null,
    status: row.status as AttendanceStatusName,
    asksHours: asking.has(row.event.id),
  }))
}
