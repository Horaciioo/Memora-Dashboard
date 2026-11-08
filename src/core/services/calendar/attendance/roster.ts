import { releasedFrom } from '@/core/services/academy/legacy/LegacyRelease'
import 'server-only'
import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { peopleInScope } from '@/core/services/work/shared'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import type { AttendanceHours, AttendancePerson, AttendanceRoster } from '@/types/calendar'
import { GONE_MEMBER_STATUSES, LEADERSHIP_ROLES } from '@/utils/constants/hierarchy'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { AttendanceStatusName } from '@/utils/constants/workflow'
import { functionTeamWhere, hoursOf, toPerson } from '@/core/services/calendar/attendance/shared'
import type { AttendanceRow, RosterAudience } from '@/core/services/calendar/attendance/shared'

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
        where: functionTeamWhere(team.youtuberId, team.functionName),
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
      ...(everyone ? { frozenAt: null } : { id: { in: candidates } }),
      status: { notIn: GONE_MEMBER_STATUSES },
      // Everyone means every account
      AND:
        includeLeadership || everyone
          ? []
          : [
              // Named Responsables still come
              { OR: [{ role: { notIn: LEADERSHIP_ROLES } }, { id: { in: memberIds } }] },
              peopleInScope(scope),
            ],
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
 * Drop the unanswered rows left out
 * @param {string} eventId - Roll-call event
 * @param {string[]} keptIds - Convened accounts
 * @return {Promise<void>} - Pruned
 */

export const pruneRoster = async (eventId: string, keptIds: string[]): Promise<void> => {
  // Live crew stays convened
  const crew = await prisma.liveMember.findMany({
    where: { live: { calendarEventId: eventId } },
    select: { accountId: true },
  })

  await prisma.eventAttendance.deleteMany({
    where: {
      eventId,
      status: AttendanceStatuses.Pending,
      accountId: { notIn: [...keptIds, ...crew.map((row) => row.accountId)] },
    },
  })
}

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

export const keepHours = (
  hours: { from: Date; to: Date } | null
): { from: Date; to: Date } | null => {
  if (hours && hours.from >= hours.to) {
    throw invalidInput([{ field: 'from', message: CALENDAR_COPY.badHours }])
  }

  return hours
}
