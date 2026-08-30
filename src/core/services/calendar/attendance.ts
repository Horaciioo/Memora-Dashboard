import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden } from '@/core/lib/errors'
import { logger } from '@/core/lib/logger'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { notify } from '@/core/services/system/NotificationService'
import { peopleInScope } from '@/core/services/work/shared'
import type { AttendancePerson, AttendanceRoster } from '@/types/calendar'
import { MemberStatuses } from '@/utils/constants/hierarchy'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { AttendanceStatusName } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

// Roll-call notification always points back at the calendar
const NOTIFY = {
  kind: 'AttendanceRequested',
  target: 'calendar',
} as const

// Row shape every roster reader maps from
type AttendanceRow = Prisma.EventAttendanceGetPayload<{
  include: { account: { select: { displayName: true; avatarUrl: true } } }
}>

/**
 * Read the members a roll-call convenes, teams expanded and everyone deduplicated
 * @param {string[]} teamIds - Convened teams
 * @param {string[]} memberIds - Members named on top of the teams
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<string[]>} - Account identifiers
 */

export const expandRoster = async (
  teamIds: string[],
  memberIds: string[],
  scope: AccessScope
): Promise<string[]> => {
  // Team members joined to the named ones
  const fromTeams = teamIds.length
    ? await prisma.teamMember.findMany({
        where: { teamId: { in: teamIds } },
        select: { accountId: true },
      })
    : []

  const candidates = [...new Set([...fromTeams.map((row) => row.accountId), ...memberIds])]
  if (candidates.length === 0) return []

  // Keep only members still around and inside the perimeter
  const accounts = await prisma.account.findMany({
    where: {
      id: { in: candidates },
      status: { not: MemberStatuses.Left },
      ...peopleInScope(scope),
    },
    select: { id: true },
  })

  return accounts.map((account) => account.id)
}

/**
 * Add the missing roster rows, an edit only ever widening the roll-call
 * @param {string} eventId - Roll-call event
 * @param {string[]} memberIds - Convened accounts
 * @return {Promise<void>} - Synced
 */

export const syncRoster = async (eventId: string, memberIds: string[]): Promise<void> => {
  if (memberIds.length === 0) return

  await prisma.eventAttendance.createMany({
    data: memberIds.map((accountId) => ({ eventId, accountId })),
    skipDuplicates: true,
  })
}

/**
 * Map an account row to a roster person
 * @param {AttendanceRow['account']} account - Account row
 * @return {AttendancePerson} - Roster person
 */

const toPerson = (account: AttendanceRow['account']): AttendancePerson => ({
  name: account.displayName,
  avatar: account.avatarUrl,
})

/**
 * Fold roster rows into per-viewer standings
 * @param {Object} input - Roster context
 * @param {AttendanceRow[]} input.rows - Roster rows with their account
 * @param {string} input.viewerId - Signed-in member
 * @param {boolean} input.canManage - Viewer runs the roll-call
 * @param {boolean} input.rosterShared - Answers are open to the team
 * @return {AttendanceRoster} - Standings
 */

export const buildRoster = ({
  rows,
  viewerId,
  canManage,
  rosterShared,
}: {
  rows: AttendanceRow[]
  viewerId: string
  canManage: boolean
  rosterShared: boolean
}): AttendanceRoster => {
  const mineRow = rows.find((row) => row.accountId === viewerId)
  const mine = (mineRow?.status as AttendanceStatusName | undefined) ?? null
  const visible = canManage || (rosterShared && mine !== null)

  const bucket = (status: AttendanceStatusName): AttendancePerson[] =>
    visible ? rows.filter((row) => row.status === status).map((row) => toPerson(row.account)) : []

  const countOf = (status: AttendanceStatusName): number =>
    rows.filter((row) => row.status === status).length

  return {
    mine,
    canManage,
    visible,
    counts: {
      present: countOf(AttendanceStatuses.Present),
      absent: countOf(AttendanceStatuses.Absent),
      pending: countOf(AttendanceStatuses.Pending),
    },
    present: bucket(AttendanceStatuses.Present),
    absent: bucket(AttendanceStatuses.Absent),
    pending: bucket(AttendanceStatuses.Pending),
  }
}

/**
 * Load one roll-call's standings for a given viewer
 * @param {string} eventId - Roll-call event
 * @param {string} viewerId - Signed-in member
 * @param {boolean} canManage - Viewer runs the roll-call
 * @return {Promise<AttendanceRoster>} - Standings
 */

export const readRosterFor = async (
  eventId: string,
  viewerId: string,
  canManage: boolean
): Promise<AttendanceRoster> => {
  const [event, rows] = await Promise.all([
    prisma.calendarEvent.findUnique({ where: { id: eventId }, select: { rosterShared: true } }),
    prisma.eventAttendance.findMany({
      where: { eventId },
      include: { account: { select: { displayName: true, avatarUrl: true } } },
    }),
  ])

  return buildRoster({
    rows,
    viewerId,
    canManage,
    rosterShared: event?.rosterShared ?? false,
  })
}

/**
 * Record one member's answer to a roll-call
 * @param {string} eventId - Roll-call event
 * @param {string} accountId - Answering member
 * @param {AttendanceStatusName} status - Present or absent
 * @param {boolean} canManage - Answerer also runs the roll-call
 * @return {Promise<AttendanceRoster>} - Refreshed standings
 */

export const respondToRollCall = async (
  eventId: string,
  accountId: string,
  status: AttendanceStatusName,
  canManage: boolean
): Promise<AttendanceRoster> => {
  // Only a convened member holds a row to answer with
  const row = await prisma.eventAttendance.findUnique({
    where: { eventId_accountId: { eventId, accountId } },
  })
  if (!row) throw forbidden()

  await prisma.eventAttendance.update({
    where: { id: row.id },
    data: { status, respondedAt: new Date() },
  })

  return readRosterFor(eventId, accountId, canManage)
}

/**
 * Read the accounts still owing an answer
 * @param {string} eventId - Roll-call event
 * @return {Promise<string[]>} - Account identifiers
 */

const pendingIds = async (eventId: string): Promise<string[]> => {
  const rows = await prisma.eventAttendance.findMany({
    where: { eventId, status: AttendanceStatuses.Pending },
    select: { accountId: true },
  })

  return rows.map((row) => row.accountId)
}

/**
 * Ping the members still owing an answer, leaving the stamp alone
 * @param {Object} event - Roll-call event
 * @param {string} event.id - Event identifier
 * @param {string} event.title - Event title
 * @param {string | null} event.ownerId - Who posted it
 * @return {Promise<void>} - Pinged
 */

export const notifyPending = async (event: {
  id: string
  title: string
  ownerId: string | null
}): Promise<void> => {
  const recipients = await pendingIds(event.id)
  if (recipients.length === 0) return

  await notify({
    ...NOTIFY,
    recipients,
    actorId: event.ownerId,
    targetId: event.id,
    subject: event.title,
    once: true,
  })
}

/**
 * Ping the members still owing an answer and mark the reminder as fired
 * @param {Object} event - Roll-call event
 * @param {string} event.id - Event identifier
 * @param {string} event.title - Event title
 * @param {string | null} event.ownerId - Who posted it
 * @return {Promise<void>} - Pinged
 */

export const remindPending = async (event: {
  id: string
  title: string
  ownerId: string | null
}): Promise<void> => {
  await notifyPending(event)

  await prisma.calendarEvent.update({
    where: { id: event.id },
    data: { remindedAt: new Date() },
  })
}

// Flipped by the runtime once a worker owns the sweep
let isScheduled = false

/**
 * Tell the request path a worker now owns the sweep
 * @return {void}
 */

export const markRemindersScheduled = (): void => {
  isScheduled = true
}

/**
 * Take ownership of one due reminder, so concurrent sweeps never both fire it
 * @param {string} eventId - Event identifier
 * @return {Promise<boolean>} - Caller owns the reminder
 */

const claimReminder = async (eventId: string): Promise<boolean> => {
  const { count } = await prisma.calendarEvent.updateMany({
    where: { id: eventId, remindedAt: null },
    data: { remindedAt: new Date() },
  })

  return count === 1
}

/**
 * Fire every roll-call reminder now due, once each. This is the work itself,
 * called by the worker that owns it and, failing that, by whoever opens the calendar
 * @return {Promise<void>} - Swept
 */

export const runReminderSweep = async (): Promise<void> => {
  try {
    const due = await prisma.calendarEvent.findMany({
      where: { rollCall: true, remindAt: { lte: new Date() }, remindedAt: null },
      select: { id: true, title: true, ownerId: true },
    })

    // Claiming before notifying is what makes a parallel sweep harmless
    const claimed = await Promise.all(
      due.map(async (event) => ((await claimReminder(event.id)) ? event : null))
    )

    await Promise.all(
      claimed
        .filter((event): event is (typeof due)[number] => event !== null)
        .map((event) => notifyPending(event))
    )
  } catch (error) {
    // A missed sweep is caught by the next read, but it stops being invisible
    logger.warn('[calendar] reminder sweep failed', error)
  }
}

/**
 * Sweep from the request path, unless a worker already owns the job
 * @return {Promise<void>} - Swept
 */

export const sweepDueReminders = async (): Promise<void> => {
  if (isScheduled) return

  await runReminderSweep()
}

/**
 * Notify a fresh set of convened members
 * @param {Object} event - Roll-call event
 * @param {string} event.id - Event identifier
 * @param {string} event.title - Event title
 * @param {string | null} event.ownerId - Who posted it
 * @param {string[]} recipients - Accounts to reach
 * @return {Promise<void>} - Notified
 */

export const notifyConvened = async (
  event: { id: string; title: string; ownerId: string | null },
  recipients: string[]
): Promise<void> => {
  if (recipients.length === 0) return

  await notify({
    ...NOTIFY,
    recipients,
    actorId: event.ownerId,
    targetId: event.id,
    subject: event.title,
  })
}

/**
 * One roll-call awaiting the signed-in member's answer
 * @typedef {Object} PendingRollCall
 * @property {string} eventId - Event identifier
 * @property {string} title - Event title
 * @property {string | null} emoji - Event glyph
 * @property {string} startsAt - ISO start
 * @property {AttendanceStatusName} status - Member's current answer
 */

export interface PendingRollCall {
  eventId: string
  title: string
  emoji: string | null
  startsAt: string
  status: AttendanceStatusName
}

/**
 * Read the roll-calls that still concern one member, soonest first
 * @param {string} accountId - Signed-in member
 * @return {Promise<PendingRollCall[]>} - Upcoming roll-calls
 */

export const myRollCalls = async (accountId: string): Promise<PendingRollCall[]> => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const rows = await prisma.eventAttendance.findMany({
    where: { accountId, event: { rollCall: true, startsAt: { gte: start } } },
    include: { event: { select: { id: true, title: true, emoji: true, startsAt: true } } },
    orderBy: { event: { startsAt: 'asc' } },
  })

  return rows.map((row) => ({
    eventId: row.event.id,
    title: row.event.title,
    emoji: row.event.emoji,
    startsAt: row.event.startsAt.toISOString(),
    status: row.status as AttendanceStatusName,
  }))
}
