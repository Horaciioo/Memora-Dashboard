import { releasedFrom } from '@/core/services/academy/legacy/LegacyRelease'
import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { logger } from '@/core/lib/logger'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { syncJuniorLives } from '@/core/services/academy/parkour/LiveCountService'
import { notify } from '@/core/services/system/NotificationService'
import { peopleInScope } from '@/core/services/work/shared'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import type { AttendanceHours, AttendancePerson, AttendanceRoster } from '@/types/calendar'
import { GONE_MEMBER_STATUSES, LEADERSHIP_ROLES } from '@/utils/constants/hierarchy'
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
  include: { account: { select: { displayName: true; avatarUrl: true; role: true } } }
}>

/**
 * Who a roll-call convenes besides the teams and members named on the form
 * @typedef {Object} RosterAudience
 * @property {boolean} [everyone] - Whole perimeter
 * @property {string | null} [youtuberId] - Whole team of a creator
 * @property {boolean} [responsables] - Every Responsable and Administrator
 * @property {{ youtuberId: string | null, functionName: string } | null} [team] - Team of a creator for a function, with its Responsables
 * @property {boolean} [includeLeadership] - Responsables and Administrators are convened too
 */

export interface RosterAudience {
  everyone?: boolean
  youtuberId?: string | null
  responsables?: boolean
  team?: { youtuberId: string | null; functionName: string } | null
  includeLeadership?: boolean
}

/**
 * Read the members a roll-call convenes
 * @param {string[]} teamIds - Convened teams
 * @param {string[]} memberIds - Members named on top of the teams
 * @param {AccessScope} scope - Creator perimeter
 * @param {Date} startsAt - Start of the event
 * @param {RosterAudience} [audience] - Who is convened on top of the named members
 * @return {Promise<string[]>} - Account identifiers
 */

export const expandRoster = async (
  teamIds: string[],
  memberIds: string[],
  scope: AccessScope,
  startsAt: Date,
  audience: RosterAudience = {}
): Promise<string[]> => {
  const { everyone = false, youtuberId = null, responsables = false, team = null } = audience
  // A model that always calls the roll convenes the Responsables too
  const includeLeadership = audience.includeLeadership ?? false

  // Team members joined to the named ones
  const fromTeams = teamIds.length
    ? await prisma.teamMember.findMany({
        where: { teamId: { in: teamIds } },
        select: { accountId: true },
      })
    : []

  // A creator's whole team is convened without being named
  const fromCreator = youtuberId
    ? await prisma.account.findMany({
        where: { youtubers: { some: { id: youtuberId } } },
        select: { id: true },
      })
    : []

  // A team meeting convenes the team of the creator for a function, its Responsables with it
  const fromFunctionTeam = team
    ? await prisma.team.findFirst({
        where: { youtuberId: team.youtuberId, jobFunction: { name: team.functionName } },
        select: {
          members: { select: { accountId: true } },
          leads: { select: { accountId: true } },
        },
      })
    : null

  // Every Responsable and Administrator
  const fromLeadership = responsables
    ? await prisma.account.findMany({
        where: { role: { in: LEADERSHIP_ROLES } },
        select: { id: true },
      })
    : []

  const candidates = [
    ...new Set([
      ...fromTeams.map((row) => row.accountId),
      ...fromCreator.map((row) => row.id),
      ...(fromFunctionTeam?.members.map((row) => row.accountId) ?? []),
      ...(fromFunctionTeam?.leads.map((row) => row.accountId) ?? []),
      ...fromLeadership.map((row) => row.id),
      ...memberIds,
    ]),
  ]
  if (candidates.length === 0 && !everyone) return []

  // Keep only members still around and inside the perimeter
  const accounts = await prisma.account.findMany({
    where: {
      ...(everyone ? {} : { id: { in: candidates } }),
      status: { notIn: GONE_MEMBER_STATUSES },
      ...(includeLeadership ? {} : { role: { notIn: LEADERSHIP_ROLES } }),
      ...(includeLeadership ? {} : peopleInScope(scope)),
    },
    select: { id: true },
  })

  // A Junior Responsable in training is released from every event of their period
  const released = await releasedFrom(
    accounts.map((account) => account.id),
    startsAt
  )

  return accounts.map((account) => account.id).filter((id) => !released.has(id))
}

/**
 * Add the missing roster rows
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
 * Hours a row carries
 * @param {AttendanceRow} row - Roster row
 * @return {AttendanceHours | null} - Hours given
 */

const hoursOf = (row: AttendanceRow): AttendanceHours | null =>
  row.availableFrom && row.availableTo
    ? { from: row.availableFrom.toISOString(), to: row.availableTo.toISOString() }
    : null

/**
 * Events whose roll-call asks for hours: the lives
 * @param {string[]} eventIds - Roll-call events
 * @return {Promise<Set<string>>} - Events asking
 */

export const eventsAskingHours = async (eventIds: string[]): Promise<Set<string>> => {
  if (eventIds.length === 0) return new Set()

  const lives = await prisma.live.findMany({
    where: { calendarEventId: { in: eventIds } },
    select: { calendarEventId: true },
  })

  return new Set(lives.flatMap((live) => (live.calendarEventId ? [live.calendarEventId] : [])))
}

/**
 * Members called in as reinforcement on the lives behind some events
 * @param {string[]} eventIds - Roll-call events
 * @return {Promise<Map<string, Set<string>>>} - Reinforcements per event
 */

export const reinforcedByEvent = async (eventIds: string[]): Promise<Map<string, Set<string>>> => {
  if (eventIds.length === 0) return new Map()

  const rows = await prisma.liveMember.findMany({
    where: { reinforcement: true, live: { calendarEventId: { in: eventIds } } },
    select: { accountId: true, live: { select: { calendarEventId: true } } },
  })
  const byEvent = new Map<string, Set<string>>()
  for (const row of rows) {
    const eventId = row.live.calendarEventId
    if (eventId) byEvent.set(eventId, (byEvent.get(eventId) ?? new Set()).add(row.accountId))
  }

  return byEvent
}

/**
 * Map an account row to a roster person
 * @param {AttendanceRow} row - Roster row
 * @return {AttendancePerson} - Roster person
 */

const toPerson = (row: AttendanceRow, reinforced: Set<string>): AttendancePerson => ({
  id: row.accountId,
  name: row.account.displayName,
  avatar: row.account.avatarUrl,
  hours: hoursOf(row),
  isReinforcement: reinforced.has(row.accountId),
})

/**
 * Fold roster rows into per-viewer standings
 * @param {Object} input - Roster context
 * @param {AttendanceRow[]} input.rows - Roster rows with their account
 * @param {string} input.viewerId - Signed-in member
 * @param {boolean} input.canManage - Viewer runs the roll-call
 * @param {boolean} input.asksHours - A live asks for hours
 * @param {Set<string>} input.reinforced - Members called in as reinforcement
 * @return {AttendanceRoster} - Standings
 */

export const buildRoster = ({
  rows,
  viewerId,
  canManage,
  asksHours,
  reinforced,
}: {
  rows: AttendanceRow[]
  viewerId: string
  canManage: boolean
  asksHours: boolean
  reinforced: Set<string>
}): AttendanceRoster => {
  const mineRow = rows.find((row) => row.accountId === viewerId)
  // Leadership never shows on the roll-call
  const listed = rows.filter((row) => !LEADERSHIP_ROLES.includes(row.account.role))
  const mine = (mineRow?.status as AttendanceStatusName | undefined) ?? null
  // Only the Responsables and above read who answered what
  const visible = canManage

  const bucket = (status: AttendanceStatusName): AttendancePerson[] =>
    visible
      ? listed
          .filter((row) => row.status === status)
          .map((row) => toPerson(row, reinforced))
          .sort((first, second) =>
            first.name.localeCompare(second.name, 'fr', { sensitivity: 'base' })
          )
      : []

  const countOf = (status: AttendanceStatusName): number =>
    listed.filter((row) => row.status === status).length

  return {
    mine,
    asksHours,
    myHours: mineRow ? hoursOf(mineRow) : null,
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
  const rows = await prisma.eventAttendance.findMany({
    where: { eventId },
    include: { account: { select: { displayName: true, avatarUrl: true, role: true } } },
  })

  const asking = await eventsAskingHours([eventId])
  const reinforced = (await reinforcedByEvent([eventId])).get(eventId) ?? new Set<string>()

  return buildRoster({ rows, viewerId, canManage, asksHours: asking.has(eventId), reinforced })
}

/**
 * Check the hours given, none when the step was skipped
 * @param {{ from: Date, to: Date } | null} hours - Hours given
 * @return {{ from: Date, to: Date } | null} - Hours kept
 */

const keepHours = (hours: { from: Date; to: Date } | null): { from: Date; to: Date } | null => {
  if (hours && hours.from >= hours.to) {
    throw invalidInput([{ field: 'from', message: CALENDAR_COPY.badHours }])
  }

  return hours
}

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
 * Ping the members still owing an answer
 * @param {Object} event - Roll-call event
 * @param {string} event.id - Event identifier
 * @param {string} event.title - Event title
 * @param {string | null} event.ownerId - Who posted it
 * @param {string | null} [actorId] - Who pressed the reminder, defaults to the poster
 * @return {Promise<void>} - Pinged
 */

export const notifyPending = async (
  event: { id: string; title: string; ownerId: string | null },
  actorId?: string
): Promise<void> => {
  const recipients = await pendingIds(event.id)
  if (recipients.length === 0) return

  await notify({
    ...NOTIFY,
    recipients,
    actorId: actorId ?? event.ownerId,
    targetId: event.id,
    subject: event.title,
    // A pressed reminder always lands, the automatic one stays quiet while one waits unread
    once: actorId === undefined,
  })
}

/**
 * Ping the members still owing an answer and mark the reminder as fired
 * @param {Object} event - Roll-call event
 * @param {string} event.id - Event identifier
 * @param {string} event.title - Event title
 * @param {string | null} event.ownerId - Who posted it
 * @param {string} [actorId] - Who pressed the reminder
 * @return {Promise<void>} - Pinged
 */

export const remindPending = async (
  event: { id: string; title: string; ownerId: string | null },
  actorId?: string
): Promise<void> => {
  await notifyPending(event, actorId)

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
 * Take ownership of one due reminder
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
 * Fire every roll-call reminder now due
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
    // A missed sweep is caught by the next read
    logger.warn('[calendar] reminder sweep failed', error)
  }
}

/**
 * Sweep from the request path
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
