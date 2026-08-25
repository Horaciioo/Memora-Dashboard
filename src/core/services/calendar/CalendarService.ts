import 'server-only'

import { prisma } from '@/core/lib/db'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { forbidden, notFound } from '@/core/lib/errors'
import { rowsToOptions, toOptions } from '@/core/lib/forms/options'
import { readDate, readFlag, readText } from '@/core/lib/forms/values'
import { projectOptions, youtuberOptions } from '@/core/services/work/shared'
import { ACADEMY_STAGE_REGISTRY } from '@/declarations/academy/registries'
import { CALENDAR_FIELD_COPY } from '@/declarations/calendar/copy'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { EVENT_VISIBILITY_REGISTRY } from '@/declarations/reference/registries'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import type { PermissionHelpers } from '@/types/auth'
import type { CalendarEntry } from '@/types/calendar'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { AcademyStageName } from '@/utils/constants/hierarchy'
import { EventVisibilities } from '@/utils/constants/workflow'
import type { EventVisibilityName } from '@/utils/constants/workflow'

/**
 * Build the calendar entry form declarations
 * @param {AccessScope} [scope] - Creator perimeter
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const calendarFields = async (scope?: AccessScope): Promise<FieldDefinition[]> => {
  const [types, youtubers, projects] = await Promise.all([
    prisma.eventType.findMany({ where: { archived: false }, orderBy: { position: 'asc' } }),
    youtuberOptions(scope),
    projectOptions(),
  ])

  return [
    {
      name: 'title',
      kind: 'text',
      label: CALENDAR_FIELD_COPY.title,
      required: true,
      maxLength: FORM_SETTINGS.titleMaxLength,
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
      name: 'typeId',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.type,
      required: true,
      options: rowsToOptions(types),
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'visibility',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.visibility,
      options: toOptions(EVENT_VISIBILITY_REGISTRY),
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.essentials,
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

/**
 * Shape one stored entry
 * @param {object} row - Entry row with its type and owner
 * @return {CalendarEntry} - Calendar entry
 */

const toEntry = (row: {
  id: string
  title: string
  description: string | null
  typeId: string | null
  visibility: EventVisibilityName | null
  startsAt: Date
  endsAt: Date | null
  allDay: boolean
  youtuberId: string | null
  projectId: string | null
  type: { name: string; accent: string | null; visibility: EventVisibilityName } | null
  owner: { displayName: string } | null
}): CalendarEntry => ({
  id: row.id,
  title: row.title,
  description: row.description,
  typeId: row.typeId,
  typeName: row.type?.name ?? null,
  accent: row.type?.accent ?? null,
  // The entry may tighten what its type allows, never loosen it silently
  visibility: row.visibility ?? row.type?.visibility ?? EventVisibilities.Everyone,
  startsAt: row.startsAt.toISOString(),
  endsAt: row.endsAt?.toISOString() ?? null,
  allDay: row.allDay,
  ownerName: row.owner?.displayName ?? null,
  readOnly: false,
  values: {
    title: row.title,
    typeId: row.typeId,
    visibility: row.visibility,
    startsAt: row.startsAt.toISOString().slice(0, 16),
    endsAt: row.endsAt ? row.endsAt.toISOString().slice(0, 16) : null,
    allDay: row.allDay,
    youtuberId: row.youtuberId,
    projectId: row.projectId,
    description: row.description,
  },
})

// Everything an entry row needs to become a view
const ENTRY_SHAPE = { type: true, owner: true } as const

/**
 * Project a dated timeline step as a read-only calendar entry, never copied into CalendarEvent
 * @param {object} row - Step row with its stage and junior
 * @return {CalendarEntry} - Projected entry
 */

const toProjectedEntry = (row: {
  id: string
  title: string
  notes: string | null
  stage: AcademyStageName | null
  scheduledAt: Date | null
  junior: { account: { displayName: string } } | null
}): CalendarEntry => {
  const stage = row.stage ? ACADEMY_STAGE_REGISTRY.get(row.stage) : null

  return {
    id: `step:${row.id}`,
    title: row.junior ? `${row.title} — ${row.junior.account.displayName}` : row.title,
    description: row.notes,
    typeId: null,
    typeName: stage?.label ?? null,
    accent: stage?.accent ?? null,
    visibility: EventVisibilities.Everyone,
    startsAt: (row.scheduledAt ?? new Date()).toISOString(),
    endsAt: null,
    allDay: true,
    ownerName: null,
    readOnly: true,
    values: {},
  }
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
  const levels = allowedVisibilities(access)

  const rows = await prisma.calendarEvent.findMany({
    where: scopedWhere('calendarEvent', scope, {
      startsAt: { gte: from, lte: to },
      ...(sessionId ? { sessionId } : {}),
      OR: [
        // Someone always sees what they posted themselves
        { ownerId: viewerId },
        { visibility: { in: levels } },
        { visibility: null, type: { visibility: { in: levels } } },
        { visibility: null, typeId: null },
      ],
    }),
    include: ENTRY_SHAPE,
    orderBy: { startsAt: 'asc' },
  })

  const entries = rows.map(toEntry)
  if (!sessionId) return entries

  const steps = await prisma.academyStep.findMany({
    where: { sessionId, scheduledAt: { gte: from, lte: to } },
    include: { junior: { include: { account: true } } },
    orderBy: { scheduledAt: 'asc' },
  })

  return [...entries, ...steps.map(toProjectedEntry)].sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt)
  )
}

/**
 * Turn parsed values into an entry payload
 * @param {FormValues} values - Parsed body
 * @return {object} - Database payload
 */

const toEntryData = (values: FormValues) => ({
  title: readText(values, 'title') ?? '',
  description: readText(values, 'description'),
  typeId: readText(values, 'typeId'),
  visibility: (readText(values, 'visibility') ?? null) as EventVisibilityName | null,
  startsAt: readDate(values, 'startsAt') ?? new Date(),
  endsAt: readDate(values, 'endsAt'),
  allDay: readFlag(values, 'allDay'),
  youtuberId: readText(values, 'youtuberId'),
  projectId: readText(values, 'projectId'),
})

/**
 * Post an entry on the calendar
 * @param {string} ownerId - Who posts it
 * @param {FormValues} values - Parsed body
 * @return {Promise<CalendarEntry>} - Created entry
 */

export const createEntry = async (ownerId: string, values: FormValues): Promise<CalendarEntry> => {
  const row = await prisma.calendarEvent.create({
    data: { ownerId, ...toEntryData(values) },
    include: ENTRY_SHAPE,
  })

  return toEntry(row)
}

/**
 * Edit an entry
 * @param {string} id - Entry identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<CalendarEntry>} - Updated entry
 */

export const updateEntry = async (id: string, values: FormValues): Promise<CalendarEntry> => {
  const row = await prisma.calendarEvent.update({
    where: { id },
    data: toEntryData(values),
    include: ENTRY_SHAPE,
  })

  return toEntry(row)
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
 * Drop an entry
 * @param {string} id - Entry identifier
 * @return {Promise<void>} - Removed
 */

export const removeEntry = async (id: string): Promise<void> => {
  await prisma.calendarEvent.delete({ where: { id } })
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
