import 'server-only'
import { prisma } from '@/core/lib/db'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { wholeDays } from '@/core/lib/calendar/wholeDays'
import {
  buildRoster,
  eventsAskingHours,
  reinforcedByEvent,
  readRosterFor,
  sweepDueReminders,
} from '@/core/services/calendar/attendance'
import {
  absenceEntries,
  academySessionEntries,
  academyZoneEntries,
  birthdayEntries,
  meetingEntries,
  recruitmentEntries,
} from '@/core/services/calendar/projections'
import type { ProjectedPosts, ProjectionContext } from '@/core/services/calendar/projections'
import { audienceValue } from '@/core/services/calendar/audience'
import { visibleWhere } from '@/core/services/calendar/visibility'
import { logger } from '@/core/lib/logger'
import {
  sweepAnnualReminders,
  syncAnnualProjectStates,
} from '@/core/services/calendar/AnnualSlotService'
import { instantToWall } from '@/utils/format/time/zone'
import { openDueReviews } from '@/core/services/calendar/reviewEntries'
import { workViewerOf } from '@/core/services/work/visibility'
import { ANNUAL_REVIEW_COPY } from '@/declarations/calendar/copy'
import { ROUTES } from '@/declarations/navigation'
import type { PermissionHelpers } from '@/types/auth'
import type { AttendanceRoster, CalendarEntry } from '@/types/calendar'
import type { FieldCondition } from '@/types/forms'
import { Permissions } from '@/utils/constants/permissions'
import { CalendarKinds, CalendarSources, EventVisibilities } from '@/utils/constants/workflow'
import type { CalendarKindName, EventVisibilityName } from '@/utils/constants/workflow'
import { MINUTE_MS } from '@/utils/constants/time'

/**
 * Add a rule at the end of the chain of a display rule
 * @param {FieldCondition | undefined} condition - Rule held
 * @param {FieldCondition} extra - Rule that must hold too
 * @return {FieldCondition} - Both rules
 */

export const andAlso = (
  condition: FieldCondition | undefined,
  extra: FieldCondition
): FieldCondition => (condition ? { ...condition, and: andAlso(condition.and, extra) } : extra)

// Everything an entry row needs to become a view
export const ENTRY_SHAPE = {
  template: true,
  youtuber: { select: { accent: true } },
  owner: { select: { displayName: true } },
  subject: {
    select: {
      displayName: true,
      functions: {
        select: {
          jobFunction: { select: { name: true, accent: true, kind: true, position: true } },
        },
      },
    },
  },
  attendances: { select: { accountId: true } },
  live: { select: { id: true } },
} as const

/**
 * Shape one stored entry
 * @param {object} row - Entry row with its template
 * @param {AttendanceRoster | null} [roster] - Roll-call standings for the viewer
 * @return {CalendarEntry} - Calendar entry
 */

export const toEntry = (
  row: {
    id: string
    title: string
    emoji: string | null
    description: string | null
    kind: CalendarKindName
    templateId: string | null
    accountId: string | null
    visibility: EventVisibilityName | null
    audienceTeamId: string | null
    audienceSessionId: string | null
    audienceLeadsOnly: boolean
    startsAt: Date
    endsAt: Date | null
    allDay: boolean
    youtuberId: string | null
    projectId: string | null
    meetingId: string | null
    live?: { id: string } | null
    sessionId: string | null
    juniorId: string | null
    referentId: string | null
    rollCall: boolean
    rollCallTeamIds: string[]
    remindAt: Date | null
    template: {
      name: string
      accent: string | null
      visibility: EventVisibilityName
      slotMinutes: number | null
      category: string | null
    } | null
    youtuber: { accent: string | null } | null
    owner: { displayName: string } | null
    subject: ({ displayName: string } & ProjectedPosts) | null
    attendances: { accountId: string }[]
  },
  roster: AttendanceRoster | null = null
): CalendarEntry => {
  const bounds = row.allDay
    ? wholeDays(row.startsAt, row.endsAt)
    : { startsAt: row.startsAt, endsAt: row.endsAt }

  return {
    id: row.id,
    source: CalendarSources.Entry,
    kind: row.kind,
    title: row.title,
    emoji: row.emoji,
    description: row.description,
    templateId: row.templateId,
    templateName: row.template?.name ?? null,
    category: row.template?.category ?? null,
    // A slot of the annual reviews is open until a Moderator takes it
    slot: !row.template?.slotMinutes
      ? null
      : row.kind === CalendarKinds.Period
        ? 'series'
        : row.accountId
          ? 'taken'
          : 'open',
    accent: row.youtuber?.accent ?? null,
    youtuberId: row.youtuberId,
    muted: false,
    // The entry may tighten what its template allows
    visibility: row.visibility ?? row.template?.visibility ?? EventVisibilities.Everyone,
    // A whole day saved with stray hours still reads as the whole day
    startsAt: bounds.startsAt.toISOString(),
    endsAt: bounds.endsAt?.toISOString() ?? null,
    allDay: row.allDay,
    ownerName: row.owner?.displayName ?? null,
    subjectName: row.subject?.displayName ?? null,
    // A posted entry standing for a meeting still points at the file that owns its content
    href: row.live
      ? ROUTES.live(row.live.id)
      : row.meetingId
        ? ROUTES.meeting(row.meetingId)
        : row.juniorId && row.sessionId
          ? ROUTES.junior(row.sessionId, row.juniorId)
          : null,
    body: null,
    readOnly: false,
    rollCall: row.rollCall,
    attendance: roster,
    values: {
      title: row.title,
      emoji: row.emoji,
      kind: row.kind,
      templateId: row.templateId,
      accountId: row.accountId,
      // The days, hours and team a series of slots was opened with
      ...(row.template?.slotMinutes && row.kind === CalendarKinds.Period
        ? {
            slotDays: [
              instantToWall(row.startsAt).slice(0, 10),
              instantToWall(row.endsAt ?? row.startsAt).slice(0, 10),
            ],
            slotFrom: instantToWall(row.startsAt).slice(11, 16),
            slotTo: instantToWall(row.endsAt ?? row.startsAt).slice(11, 16),
            slotTeamId: row.audienceTeamId,
          }
        : {}),
      visibility: audienceValue(row),
      audienceLeadsOnly: row.audienceLeadsOnly,
      startsAt: row.startsAt.toISOString(),
      endsAt: row.endsAt?.toISOString() ?? null,
      allDay: row.allDay,
      youtuberId: row.youtuberId,
      projectId: row.projectId,
      description: row.description,
      rollCall: row.rollCall,
      remindAt: row.remindAt?.toISOString() ?? null,
      teamIds: row.rollCallTeamIds,
      memberIds: row.attendances.map((seat) => seat.accountId),
      sessionId: row.sessionId,
      juniorId: row.juniorId,
      referentId: row.referentId,
      // Whoever is convened beside the junior and their referent
      responsableIds: row.juniorId
        ? row.attendances
            .map((seat) => seat.accountId)
            .filter((id) => id !== row.accountId && id !== row.referentId)
        : [],
    },
  }
}

/**
 * Resolve every roll-call roster of a window in one round trip
 * @param {{ id: string, rollCall: boolean }[]} rows - Window rows
 * @param {string} viewerId - Signed-in member identifier
 * @param {boolean} canManage - Viewer holds the manage permission
 * @return {Promise<Map<string, AttendanceRoster>>} - Roster per event
 */

const rollCallRosters = async (
  rows: { id: string; rollCall: boolean }[],
  viewerId: string,
  canManage: boolean
): Promise<Map<string, AttendanceRoster>> => {
  const rollCalls = rows.filter((row) => row.rollCall)
  if (rollCalls.length === 0) return new Map()

  const seats = await prisma.eventAttendance.findMany({
    where: { eventId: { in: rollCalls.map((row) => row.id) } },
    include: { account: { select: { displayName: true, avatarUrl: true, role: true } } },
  })

  const asking = await eventsAskingHours(rollCalls.map((row) => row.id))

  const reinforced = await reinforcedByEvent(rollCalls.map((row) => row.id))

  return new Map(
    rollCalls.map((row) => [
      row.id,
      buildRoster({
        reinforced: reinforced.get(row.id) ?? new Set<string>(),
        rows: seats.filter((seat) => seat.eventId === row.id),
        viewerId,
        canManage,
        asksHours: asking.has(row.id),
      }),
    ])
  )
}

// Sweeps cost, a read stays light
const SWEEP_EVERY_MS = MINUTE_MS

let sweptAt = 0

/**
 * Lazy calendar chores, once per minute
 * @return {Promise<void>} - Swept
 */

const runCalendarSweeps = async (): Promise<void> => {
  if (Date.now() - sweptAt < SWEEP_EVERY_MS) return
  sweptAt = Date.now()

  // Reminders, then check-ins of periods about to end
  await sweepDueReminders()
  await openDueReviews().catch((error: unknown) => logger.error('calendar.reviews', error))
  await sweepAnnualReminders().catch((error: unknown) => logger.error('calendar.annual', error))
  await syncAnnualProjectStates().catch((error: unknown) => logger.error('calendar.annual', error))
}

/**
 * Read the entries of one window
 * @param {Object} input - Read context
 * @param {Date} input.from - First moment shown
 * @param {Date} input.to - Last moment shown
 * @param {string} input.viewerId - Signed-in member identifier
 * @param {PermissionHelpers} input.access - Permission helpers
 * @param {AccessScope} input.scope - Creator perimeter
 * @param {string} [input.sessionId] - Bounds the window to one academy session
 * @return {Promise<CalendarEntry[]>} - Visible entries
 */

export const listEntries = async ({
  from,
  to,
  viewerId,
  access,
  scope,
  sessionId,
}: {
  from: Date
  to: Date
  viewerId: string
  access: PermissionHelpers
  scope: AccessScope
  sessionId?: string
}): Promise<CalendarEntry[]> => {
  await runCalendarSweeps()

  const rows = await prisma.calendarEvent.findMany({
    where: scopedWhere('calendarEvent', scope, {
      startsAt: { lte: to },
      ...(sessionId ? { sessionId } : {}),
      AND: [
        {
          // A band or a zone is still on screen when it merely overlaps the window
          OR: [{ endsAt: { gte: from } }, { endsAt: null, startsAt: { gte: from } }],
        },
        await visibleWhere({ viewerId, access, scope }),
      ],
    }),
    include: ENTRY_SHAPE,
    orderBy: { startsAt: 'asc' },
  })

  const rosters = await rollCallRosters(rows, viewerId, access.can(Permissions.CalendarManage))

  const context: ProjectionContext = {
    from,
    to,
    access,
    scope,
    viewer: workViewerOf(viewerId, access),
  }

  // A session board only ever shows its own rows and its own zones
  const projections = sessionId
    ? await academyZoneEntries(context, sessionId)
    : (
        await Promise.all([
          absenceEntries(context),
          meetingEntries(context),
          birthdayEntries(context),
          academySessionEntries(context),
          academyZoneEntries(context),
          recruitmentEntries(context),
        ])
      ).flat()

  const entries = rows.map((row) =>
    maskTakenSlot(toEntry(row, rosters.get(row.id) ?? null), viewerId, access.isResponsable)
  )

  return [...entries, ...projections].sort((left, right) =>
    left.startsAt.localeCompare(right.startsAt)
  )
}

/**
 * Hide who holds a taken slot of the annual reviews from the members it does not concern
 * @param {CalendarEntry} entry - Entry read
 * @param {string} viewerId - Signed-in member
 * @param {boolean} seesNames - Viewer sits at responsable level
 * @return {CalendarEntry} - Entry, anonymised when the slot belongs to someone else
 */

const maskTakenSlot = (
  entry: CalendarEntry,
  viewerId: string,
  seesNames: boolean
): CalendarEntry => {
  if (entry.slot !== 'taken' || seesNames || entry.values.accountId === viewerId) return entry

  return {
    ...entry,
    title: ANNUAL_REVIEW_COPY.slotTaken,
    subjectName: null,
    description: null,
    attendance: null,
    href: null,
    values: {},
  }
}

/**
 * Read several entries as the viewer sees them
 * @param {string[]} ids - Entry identifiers
 * @param {string} viewerId - Signed-in member identifier
 * @param {PermissionHelpers} access - Permission helpers
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<CalendarEntry[]>} - Entries found
 */

export const getEntries = async (
  ids: string[],
  viewerId: string,
  access: PermissionHelpers,
  scope: AccessScope
): Promise<CalendarEntry[]> => {
  const rows = await Promise.all(ids.map((id) => getEntry(id, viewerId, access, scope)))

  return rows.filter((entry): entry is CalendarEntry => entry !== null)
}

/**
 * Read one entry by identifier
 * @param {string} id - Entry identifier
 * @param {string} viewerId - Signed-in member identifier
 * @param {PermissionHelpers} access - Permission helpers
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<CalendarEntry | null>} - Entry
 */

export const getEntry = async (
  id: string,
  viewerId: string,
  access: PermissionHelpers,
  scope: AccessScope
): Promise<CalendarEntry | null> => {
  const row = await prisma.calendarEvent.findFirst({
    where: scopedWhere('calendarEvent', scope, {
      id,
      AND: [await visibleWhere({ viewerId, access, scope })],
    }),
    include: ENTRY_SHAPE,
  })
  if (!row) return null

  const roster = row.rollCall
    ? await readRosterFor(id, viewerId, access.can(Permissions.CalendarManage))
    : null

  return maskTakenSlot(toEntry(row, roster), viewerId, access.isResponsable)
}
