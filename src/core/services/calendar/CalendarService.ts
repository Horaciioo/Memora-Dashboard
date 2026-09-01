import 'server-only'

import { prisma } from '@/core/lib/db'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { forbidden, notFound } from '@/core/lib/errors'
import { toOptions } from '@/core/lib/forms/options'
import { readDate, readFlag, readList, readText } from '@/core/lib/forms/values'
import {
  buildRoster,
  expandRoster,
  notifyConvened,
  readRosterFor,
  sweepDueReminders,
  syncRoster,
} from '@/core/services/calendar/attendance'
import {
  absenceEntries,
  academyStepEntries,
  birthdayEntries,
  meetingEntries,
  memberFunction,
} from '@/core/services/calendar/projections'
import type { ProjectionContext } from '@/core/services/calendar/projections'
import { peopleInScope, projectOptions, youtuberOptions } from '@/core/services/work/shared'
import { CALENDAR_FIELD_COPY } from '@/declarations/calendar/copy'
import { CALENDAR_KIND_REGISTRY } from '@/declarations/calendar/registries'
import {
  CALENDAR_SETTINGS,
  EMOJI_SETTINGS,
  FORM_SETTINGS,
} from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { EVENT_VISIBILITY_REGISTRY } from '@/declarations/reference/registries'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import type { PermissionHelpers } from '@/types/auth'
import type { AttendanceRoster, CalendarEntry } from '@/types/calendar'
import type { FieldDefinition, FieldOption, FormValues } from '@/types/forms'
import { MemberStatuses } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'
import { CalendarKinds, CalendarSources, EventVisibilities } from '@/utils/constants/workflow'
import type { CalendarKindName, EventVisibilityName } from '@/utils/constants/workflow'

/**
 * Read the members an entry may be attached to, each carrying the colour of its post
 * @param {AccessScope} [scope] - Viewer perimeter, unbounded when absent
 * @return {Promise<FieldOption[]>} - Select options
 */

const subjectOptions = async (scope?: AccessScope): Promise<FieldOption[]> => {
  const rows = await prisma.account.findMany({
    where: { status: { not: MemberStatuses.Left }, ...peopleInScope(scope) },
    orderBy: { displayName: 'asc' },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      primaryFunction: { select: { name: true, accent: true } },
      secondaryFunction: { select: { name: true, accent: true } },
    },
  })

  return rows.map((row) => ({
    value: row.id,
    label: row.displayName,
    image: row.avatarUrl,
    accent: memberFunction(row)?.accent,
    hint: memberFunction(row)?.name,
  }))
}

/**
 * Read the templates a new entry may start from
 * @return {Promise<FieldOption[]>} - Select options
 */

const templateOptions = async (): Promise<FieldOption[]> => {
  const rows = await prisma.eventTemplate.findMany({
    where: { archived: false },
    orderBy: [{ kind: 'asc' }, { position: 'asc' }],
  })

  return rows.map((row) => ({
    value: row.id,
    label: row.name,
    hint: CALENDAR_KIND_REGISTRY.label(row.kind),
    accent: row.accent ?? undefined,
  }))
}

/**
 * Read the teams a roll-call may convene
 * @param {AccessScope} [scope] - Creator perimeter
 * @return {Promise<FieldOption[]>} - Select options
 */

const teamOptions = async (scope?: AccessScope): Promise<FieldOption[]> => {
  const rows = await prisma.team.findMany({
    where: scope ? scopedWhere('team', scope, { archived: false }) : { archived: false },
    orderBy: { name: 'asc' },
  })

  return rows.map((row) => ({ value: row.id, label: row.name }))
}

// Roll-call form fields show only once presence is asked for
const WHEN_ROLL_CALL = { field: 'rollCall', truthy: true } as const

/**
 * Build the calendar entry form declarations
 * @param {AccessScope} [scope] - Creator perimeter
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const calendarFields = async (scope?: AccessScope): Promise<FieldDefinition[]> => {
  const [templates, subjects, youtubers, projects, teams] = await Promise.all([
    templateOptions(),
    subjectOptions(scope),
    youtuberOptions(scope),
    projectOptions(),
    teamOptions(scope),
  ])

  return [
    {
      name: 'emoji',
      kind: 'emoji',
      label: CALENDAR_FIELD_COPY.emoji,
      maxLength: EMOJI_SETTINGS.maxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'title',
      kind: 'text',
      label: CALENDAR_FIELD_COPY.title,
      required: true,
      glyph: 'emoji',
      maxLength: FORM_SETTINGS.titleMaxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'kind',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.kind,
      required: true,
      options: toOptions(CALENDAR_KIND_REGISTRY),
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.essentials,
      // A template already carries the shape it draws as
      visibleWhen: { field: 'templateId', truthy: false },
    },
    {
      name: 'templateId',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.template,
      options: templates,
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'description',
      kind: 'textarea',
      label: CALENDAR_FIELD_COPY.description,
      maxLength: FORM_SETTINGS.longTextMaxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'visibility',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.visibility,
      options: toOptions(EVENT_VISIBILITY_REGISTRY),
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.visibility,
    },
    {
      name: 'startsAt',
      kind: 'datetime',
      label: CALENDAR_FIELD_COPY.startsAt,
      required: true,
      span: 'half',
      group: FORM_GROUPS.planning,
    },
    {
      name: 'endsAt',
      kind: 'datetime',
      label: CALENDAR_FIELD_COPY.endsAt,
      span: 'half',
      group: FORM_GROUPS.planning,
    },
    {
      name: 'allDay',
      kind: 'toggle',
      label: CALENDAR_FIELD_COPY.allDay,
      group: FORM_GROUPS.planning,
    },
    {
      name: 'accountId',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.subject,
      options: subjects,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'youtuberId',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.youtuber,
      options: youtubers,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'projectId',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.project,
      options: projects,
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'rollCall',
      kind: 'toggle',
      label: CALENDAR_FIELD_COPY.rollCall,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'teamIds',
      kind: 'multiselect',
      label: CALENDAR_FIELD_COPY.teams,
      options: teams,
      mark: 'dot',
      group: FORM_GROUPS.assignment,
      visibleWhen: WHEN_ROLL_CALL,
    },
    {
      name: 'memberIds',
      kind: 'multiselect',
      label: CALENDAR_FIELD_COPY.members,
      options: subjects,
      mark: 'avatar',
      group: FORM_GROUPS.assignment,
      visibleWhen: WHEN_ROLL_CALL,
    },
    {
      name: 'rosterShared',
      kind: 'toggle',
      label: CALENDAR_FIELD_COPY.rosterShared,
      hint: CALENDAR_FIELD_COPY.rosterSharedHint,
      group: FORM_GROUPS.visibility,
      visibleWhen: WHEN_ROLL_CALL,
    },
    {
      name: 'remindAt',
      kind: 'datetime',
      label: CALENDAR_FIELD_COPY.remindAt,
      hint: CALENDAR_FIELD_COPY.remindAtHint,
      span: 'half',
      group: FORM_GROUPS.planning,
      visibleWhen: WHEN_ROLL_CALL,
    },
  ]
}

/**
 * Read the visibility levels a member is allowed to see
 * @param {PermissionHelpers} access - Permission helpers
 * @return {EventVisibilityName[]} - Allowed levels
 */

const allowedVisibilities = (access: PermissionHelpers): EventVisibilityName[] => {
  if (access.isAdmin) return EVENT_VISIBILITY_REGISTRY.keys

  return access.isResponsable
    ? [EventVisibilities.Everyone, EventVisibilities.Responsables]
    : [EventVisibilities.Everyone]
}

// Everything an entry row needs to become a view
const ENTRY_SHAPE = {
  template: true,
  youtuber: { select: { accent: true } },
  owner: { select: { displayName: true } },
  subject: {
    select: {
      displayName: true,
      primaryFunction: { select: { name: true, accent: true } },
      secondaryFunction: { select: { name: true, accent: true } },
    },
  },
  attendances: { select: { accountId: true } },
} as const

/**
 * Shape one stored entry, the creator it belongs to deciding the colour
 * @param {object} row - Entry row with its template, owner, creator, member and roster
 * @param {AttendanceRoster | null} [roster] - Roll-call standings for the viewer
 * @return {CalendarEntry} - Calendar entry
 */

const toEntry = (
  row: {
    id: string
    title: string
    emoji: string | null
    description: string | null
    kind: CalendarKindName
    templateId: string | null
    accountId: string | null
    visibility: EventVisibilityName | null
    startsAt: Date
    endsAt: Date | null
    allDay: boolean
    youtuberId: string | null
    projectId: string | null
    meetingId: string | null
    rollCall: boolean
    rosterShared: boolean
    rollCallTeamIds: string[]
    remindAt: Date | null
    template: { name: string; accent: string | null; visibility: EventVisibilityName } | null
    youtuber: { accent: string | null } | null
    owner: { displayName: string } | null
    subject: {
      displayName: string
      primaryFunction: { name: string; accent: string | null } | null
      secondaryFunction: { name: string; accent: string | null } | null
    } | null
    attendances: { accountId: string }[]
  },
  roster: AttendanceRoster | null = null
): CalendarEntry => {
  return {
    id: row.id,
    source: CalendarSources.Entry,
    kind: row.kind,
    title: row.title,
    emoji: row.emoji,
    description: row.description,
    templateId: row.templateId,
    templateName: row.template?.name ?? null,
    accent: row.youtuber?.accent ?? null,
    muted: false,
    // The entry may tighten what its template allows, never loosen it silently
    visibility: row.visibility ?? row.template?.visibility ?? EventVisibilities.Everyone,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt?.toISOString() ?? null,
    allDay: row.allDay,
    ownerName: row.owner?.displayName ?? null,
    subjectName: row.subject?.displayName ?? null,
    // A posted entry standing for a meeting still points at the file that owns its content
    href: row.meetingId ? ROUTES.meeting(row.meetingId) : null,
    body: null,
    readOnly: false,
    rollCall: row.rollCall,
    rosterShared: row.rosterShared,
    attendance: roster,
    values: {
      title: row.title,
      emoji: row.emoji,
      kind: row.kind,
      templateId: row.templateId,
      accountId: row.accountId,
      visibility: row.visibility,
      startsAt: row.startsAt.toISOString().slice(0, 16),
      endsAt: row.endsAt ? row.endsAt.toISOString().slice(0, 16) : null,
      allDay: row.allDay,
      youtuberId: row.youtuberId,
      projectId: row.projectId,
      description: row.description,
      rollCall: row.rollCall,
      rosterShared: row.rosterShared,
      remindAt: row.remindAt ? row.remindAt.toISOString().slice(0, 16) : null,
      teamIds: row.rollCallTeamIds,
      memberIds: row.attendances.map((seat) => seat.accountId),
    },
  }
}

/**
 * Resolve every roll-call roster of a window in one round trip
 * @param {{ id: string, rollCall: boolean, rosterShared: boolean }[]} rows - Window rows
 * @param {string} viewerId - Signed-in member identifier
 * @param {boolean} canManage - Viewer holds the manage permission
 * @return {Promise<Map<string, AttendanceRoster>>} - Roster per event
 */

const rollCallRosters = async (
  rows: { id: string; rollCall: boolean; rosterShared: boolean }[],
  viewerId: string,
  canManage: boolean
): Promise<Map<string, AttendanceRoster>> => {
  const rollCalls = rows.filter((row) => row.rollCall)
  if (rollCalls.length === 0) return new Map()

  const seats = await prisma.eventAttendance.findMany({
    where: { eventId: { in: rollCalls.map((row) => row.id) } },
    include: { account: { select: { displayName: true, avatarUrl: true } } },
  })

  return new Map(
    rollCalls.map((row) => [
      row.id,
      buildRoster({
        rows: seats.filter((seat) => seat.eventId === row.id),
        viewerId,
        canManage,
        rosterShared: row.rosterShared,
      }),
    ])
  )
}

/**
 * Read the entries of one window, filtered down to what the member may see
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
  // Reminders fire lazily, whoever opens the calendar first pays the sweep
  await sweepDueReminders()

  const levels = allowedVisibilities(access)

  const rows = await prisma.calendarEvent.findMany({
    where: scopedWhere('calendarEvent', scope, {
      startsAt: { lte: to },
      ...(sessionId ? { sessionId } : {}),
      AND: [
        {
          // A band or a zone is still on screen when it merely overlaps the window
          OR: [{ endsAt: { gte: from } }, { endsAt: null, startsAt: { gte: from } }],
        },
        {
          OR: [
            // Someone always sees what they posted themselves
            { ownerId: viewerId },
            // A convened member always sees their own roll-call
            { attendances: { some: { accountId: viewerId } } },
            { visibility: { in: levels } },
            { visibility: null, template: { visibility: { in: levels } } },
            { visibility: null, templateId: null },
          ],
        },
      ],
    }),
    include: ENTRY_SHAPE,
    orderBy: { startsAt: 'asc' },
  })

  const rosters = await rollCallRosters(rows, viewerId, access.can(Permissions.CalendarManage))

  const context: ProjectionContext = { from, to, access, scope }

  // A session board only ever shows its own rows and its own steps
  const projections = sessionId
    ? await academyStepEntries(context, sessionId)
    : (
        await Promise.all([
          absenceEntries(context),
          meetingEntries(context),
          birthdayEntries(context),
        ])
      ).flat()

  return [...rows.map((row) => toEntry(row, rosters.get(row.id) ?? null)), ...projections].sort(
    (left, right) => left.startsAt.localeCompare(right.startsAt)
  )
}

/**
 * Turn parsed values into an entry payload
 * @param {FormValues} values - Parsed body
 * @return {object} - Database payload
 */

const toEntryData = (values: FormValues) => ({
  title: readText(values, 'title') ?? '',
  emoji: readText(values, 'emoji'),
  description: readText(values, 'description'),
  kind: (readText(values, 'kind') ?? CalendarKinds.Event) as CalendarKindName,
  templateId: readText(values, 'templateId'),
  accountId: readText(values, 'accountId'),
  visibility: (readText(values, 'visibility') ?? null) as EventVisibilityName | null,
  startsAt: readDate(values, 'startsAt') ?? new Date(),
  endsAt: readDate(values, 'endsAt'),
  allDay: readFlag(values, 'allDay'),
  youtuberId: readText(values, 'youtuberId'),
  projectId: readText(values, 'projectId'),
  rollCall: readFlag(values, 'rollCall'),
  rosterShared: readFlag(values, 'rosterShared'),
  remindAt: readDate(values, 'remindAt'),
  rollCallTeamIds: readList(values, 'teamIds'),
})

// Milliseconds in a day, for the default reminder offset
const DAY = 86_400_000

/**
 * Settle when the reminder fires, the config default kicking in when the form left it blank
 * @param {Date} startsAt - Event start
 * @param {Date | null} remindAt - Moment picked on the form
 * @return {Date | null} - Reminder moment, null when it would already be past
 */

const resolveRemindAt = (startsAt: Date, remindAt: Date | null): Date | null => {
  if (remindAt) return remindAt

  const at = new Date(startsAt.getTime() - CALENDAR_SETTINGS.rollCallReminderLeadDays * DAY)
  at.setHours(CALENDAR_SETTINGS.rollCallReminderHour, 0, 0, 0)

  return at.getTime() <= Date.now() ? null : at
}

// Minutes are stored on the template, milliseconds are what a date needs
const MINUTE = 60_000

/**
 * Fill what a form left blank with what its template already declares
 * @param {ReturnType<typeof toEntryData>} data - Payload read off the form
 * @return {Promise<ReturnType<typeof toEntryData>>} - Payload the template completed
 */

const applyTemplate = async (data: ReturnType<typeof toEntryData>) => {
  if (!data.templateId) return data

  const template = await prisma.eventTemplate.findUnique({ where: { id: data.templateId } })
  if (!template) return data

  const allDay = data.allDay || template.allDay

  return {
    ...data,
    // The template is a pre-designed thing, its shape comes with it
    kind: template.kind,
    description: data.description ?? template.body,
    visibility: data.visibility ?? template.visibility,
    allDay,
    endsAt:
      data.endsAt ??
      (template.defaultMinutes && !allDay
        ? new Date(data.startsAt.getTime() + template.defaultMinutes * MINUTE)
        : null),
  }
}

/**
 * Post an entry on the calendar
 * @param {string} ownerId - Who posts it
 * @param {FormValues} values - Parsed body
 * @return {Promise<CalendarEntry>} - Created entry
 */

export const createEntry = async (
  ownerId: string,
  values: FormValues,
  scope: AccessScope
): Promise<CalendarEntry> => {
  const data = await applyTemplate(toEntryData(values))

  const row = await prisma.calendarEvent.create({
    data: {
      ownerId,
      ...data,
      remindAt: data.rollCall ? resolveRemindAt(data.startsAt, data.remindAt) : null,
    },
    include: ENTRY_SHAPE,
  })

  if (!data.rollCall) return toEntry(row)

  // Fan the roll-call out to its convened members
  const memberIds = await expandRoster(data.rollCallTeamIds, readList(values, 'memberIds'), scope)
  await syncRoster(row.id, memberIds)
  await notifyConvened({ id: row.id, title: row.title, ownerId }, memberIds)

  const fresh = await prisma.calendarEvent.findUnique({
    where: { id: row.id },
    include: ENTRY_SHAPE,
  })

  return toEntry(fresh ?? row, await readRosterFor(row.id, ownerId, true))
}

/**
 * Edit an entry
 * @param {string} id - Entry identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} viewerId - Signed-in member identifier
 * @param {boolean} canManage - Viewer holds the manage permission
 * @return {Promise<CalendarEntry>} - Updated entry
 */

export const updateEntry = async (
  id: string,
  values: FormValues,
  scope: AccessScope,
  viewerId: string,
  canManage: boolean
): Promise<CalendarEntry> => {
  const data = await applyTemplate(toEntryData(values))

  const row = await prisma.calendarEvent.update({
    where: { id },
    data: {
      ...data,
      remindAt: data.rollCall ? resolveRemindAt(data.startsAt, data.remindAt) : null,
    },
    include: ENTRY_SHAPE,
  })

  if (!data.rollCall) return toEntry(row)

  // Widen the roster, then ping only the members newly convened
  const known = new Set(row.attendances.map((seat) => seat.accountId))
  const memberIds = await expandRoster(data.rollCallTeamIds, readList(values, 'memberIds'), scope)
  await syncRoster(id, memberIds)
  await notifyConvened(
    { id, title: row.title, ownerId: row.ownerId },
    memberIds.filter((memberId) => !known.has(memberId))
  )

  const fresh = await prisma.calendarEvent.findUnique({ where: { id }, include: ENTRY_SHAPE })

  return toEntry(fresh ?? row, await readRosterFor(id, viewerId, canManage))
}

/**
 * Move an entry to another moment, keeping its length
 * @param {string} id - Entry identifier
 * @param {Date} startsAt - New start
 * @return {Promise<CalendarEntry>} - Moved entry
 */

export const moveEntry = async (id: string, startsAt: Date): Promise<CalendarEntry> => {
  const current = await prisma.calendarEvent.findUnique({ where: { id } })
  if (!current) throw notFound()

  // Dragging never stretches an entry, so the end follows the same shift
  const shift = startsAt.getTime() - current.startsAt.getTime()
  const endsAt = current.endsAt ? new Date(current.endsAt.getTime() + shift) : null

  const row = await prisma.calendarEvent.update({
    where: { id },
    data: { startsAt, endsAt },
    include: ENTRY_SHAPE,
  })

  return toEntry(row)
}

/**
 * Stretch an entry to a new end, the start staying put
 * @param {string} id - Entry identifier
 * @param {Date} endsAt - New end
 * @return {Promise<CalendarEntry>} - Resized entry
 */

export const resizeEntry = async (id: string, endsAt: Date): Promise<CalendarEntry> => {
  const current = await prisma.calendarEvent.findUnique({ where: { id } })
  if (!current) throw notFound()
  if (endsAt <= current.startsAt) throw notFound()

  const row = await prisma.calendarEvent.update({
    where: { id },
    data: { endsAt },
    include: ENTRY_SHAPE,
  })

  return toEntry(row)
}

/**
 * Drop an entry
 * @param {string} id - Entry identifier
 * @return {Promise<void>} - Removed
 */

export const removeEntry = async (id: string): Promise<void> => {
  await prisma.calendarEvent.delete({ where: { id } })
}

/**
 * Apply one change to a whole selection
 * @param {string[]} ids - Selected entries
 * @param {FormValues} values - Parsed body
 * @return {Promise<CalendarEntry[]>} - Updated entries
 */

export const updateEntries = async (
  ids: string[],
  values: FormValues
): Promise<CalendarEntry[]> => {
  // Only the keys actually sent are written, so a bulk edit never blanks the rest
  const data = Object.fromEntries(
    Object.entries(toEntryData(values)).filter(([key]) => key in values)
  )

  await prisma.calendarEvent.updateMany({ where: { id: { in: ids } }, data })

  const rows = await prisma.calendarEvent.findMany({
    where: { id: { in: ids } },
    include: ENTRY_SHAPE,
  })

  return rows.map((row) => toEntry(row))
}

/**
 * Drop a whole selection
 * @param {string[]} ids - Selected entries
 * @return {Promise<void>} - Removed
 */

export const removeEntries = async (ids: string[]): Promise<void> => {
  await prisma.calendarEvent.deleteMany({ where: { id: { in: ids } } })
}

/**
 * Guard a write, an entry only reachable by its owner or by a calendar manager
 * @param {string} id - Entry identifier
 * @param {string} viewerId - Signed-in member identifier
 * @param {boolean} canManage - Member holds the manage permission
 * @return {Promise<void>} - Throws when neither owner nor manager
 */

export const assertEntryAccess = async (
  id: string,
  viewerId: string,
  canManage: boolean
): Promise<void> => {
  if (canManage) return

  const row = await prisma.calendarEvent.findUnique({ where: { id }, select: { ownerId: true } })
  if (!row) throw notFound()
  if (row.ownerId !== viewerId) throw forbidden()
}

/**
 * Guard a bulk write, every entry of the selection passing the single-entry guard
 * @param {string[]} ids - Selected entries
 * @param {string} viewerId - Signed-in member identifier
 * @param {boolean} canManage - Member holds the manage permission
 * @return {Promise<void>} - Throws on the first entry out of reach
 */

export const assertEntriesAccess = async (
  ids: string[],
  viewerId: string,
  canManage: boolean
): Promise<void> => {
  if (canManage) return

  const reachable = await prisma.calendarEvent.count({
    where: { id: { in: ids }, ownerId: viewerId },
  })
  if (reachable !== ids.length) throw forbidden()
}

/**
 * Read one entry by identifier, for a deep link opening straight on its detail
 * @param {string} id - Entry identifier
 * @param {string} viewerId - Signed-in member identifier
 * @param {PermissionHelpers} access - Permission helpers
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<CalendarEntry | null>} - Entry, or null when out of reach
 */

export const getEntry = async (
  id: string,
  viewerId: string,
  access: PermissionHelpers,
  scope: AccessScope
): Promise<CalendarEntry | null> => {
  const row = await prisma.calendarEvent.findFirst({
    where: scopedWhere('calendarEvent', scope, { id }),
    include: ENTRY_SHAPE,
  })
  if (!row) return null

  const roster = row.rollCall
    ? await readRosterFor(id, viewerId, access.can(Permissions.CalendarManage))
    : null

  return toEntry(row, roster)
}

/**
 * Count the templates a member may start from
 * @return {Promise<number>} - Declared templates
 */

export const countTemplates = (): Promise<number> =>
  prisma.eventTemplate.count({ where: { archived: false } })
