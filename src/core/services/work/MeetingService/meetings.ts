import 'server-only'
import { prisma } from '@/core/lib/db'
import { assertAllInScope, assertRowInScope, scopedWhere } from '@/core/services/auth/ScopeService'
import { hideMeetingContent } from '@/core/services/work/redaction'
import { meetingVisibility } from '@/core/services/work/visibility'
import type { WorkViewer } from '@/core/services/work/visibility'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { notFound } from '@/core/lib/errors'
import { readDate, readList, readNumberValue, readText } from '@/core/lib/forms/values'
import { emojiOrRandom } from '@/core/lib/work'
import {
  creatorLinks,
  defaultState,
  keptCreatorIds,
  positionAt,
  readCreatorIds,
} from '@/core/services/work/shared'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { MEETING_AUDIENCE_REGISTRY } from '@/declarations/work/registries'
import type { FormValues } from '@/types/forms'
import type { MeetingCalendarView, MeetingDetail, MeetingSummary } from '@/types/work'
import {
  AttendeeKinds,
  CalendarKinds,
  MeetingAudiences,
  WorkflowScopes,
} from '@/utils/constants/workflow'
import { instantToWall } from '@/utils/format/time/zone'
import type { MeetingAudienceName } from '@/utils/constants/workflow'
import { MINUTE_MS } from '@/utils/constants/time'
import { MEETING_INCLUDE, toMeetingSummary } from '@/core/services/work/MeetingService/shape'
import { toTopic } from '@/core/services/work/MeetingService/topics'

/**
 * Read every meeting
 * @param {AccessScope} scope - Creator perimeter
 * @param {WorkViewer} viewer - Who reads
 * @return {Promise<MeetingSummary[]>} - Board cards
 */

export const listMeetings = async (
  scope: AccessScope,
  viewer: WorkViewer
): Promise<MeetingSummary[]> => {
  const rows = await prisma.meeting.findMany({
    where: { AND: [scopedWhere('meeting', scope, {}), meetingVisibility(viewer)] },
    include: MEETING_INCLUDE,
    orderBy: [{ scheduledAt: 'desc' }],
  })

  return rows.map((row) => hideMeetingContent(toMeetingSummary(row), viewer.readsContent))
}

/**
 * Build the attendee rows of a meeting
 * @param {FormValues} values - Parsed body
 * @return {Array<{ accountId: string, kind: AttendeeKindName }>} - Attendee rows
 */

const toAttendees = (values: FormValues) => {
  const seen = new Set<string>()

  // A member holds one seat only
  return (
    [
      [AttendeeKinds.Lead, readList(values, 'leadIds')],
      [AttendeeKinds.Assistant, readList(values, 'assistantIds')],
      [AttendeeKinds.Participant, readList(values, 'participantIds')],
    ] as const
  ).flatMap(([kind, ids]) =>
    ids
      .filter((accountId) => !seen.has(accountId) && seen.add(accountId))
      .map((accountId) => ({ accountId, kind }))
  )
}

/**
 * Read the audience
 * @param {FormValues} values - Parsed body
 * @return {MeetingAudienceName} - Audience
 */

const readAudience = (values: FormValues): MeetingAudienceName => {
  const picked = readText(values, 'audience')

  return picked && MEETING_AUDIENCE_REGISTRY.has(picked)
    ? (picked as MeetingAudienceName)
    : MeetingAudiences.Custom
}

/**
 * Turn parsed values into a database payload
 * @param {FormValues} values - Parsed body
 * @return {Prisma.MeetingUncheckedUpdateInput} - Database payload
 */

const toMeetingData = (values: FormValues) => ({
  title: readText(values, 'title') ?? '',
  emoji: readText(values, 'emoji'),
  introduction: readText(values, 'introduction'),
  outro: readText(values, 'outro'),
  minutes: readText(values, 'minutes'),
  durationMin: readNumberValue(values, 'durationMin'),
  audience: readAudience(values),
  stateId: readText(values, 'stateId'),
  projectId: readText(values, 'projectId'),
})

/**
 * Plan a meeting
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} actorId - Who planned it
 * @return {Promise<MeetingSummary>} - Created card
 */

export const createMeeting = async (
  values: FormValues,
  scope: AccessScope,
  actorId: string
): Promise<MeetingSummary> => {
  const data = toMeetingData(values)
  const youtuberIds = readCreatorIds(values)
  assertAllInScope(scope, youtuberIds)

  const stateId = data.stateId ?? (await defaultState(WorkflowScopes.Meeting))

  // A new card lands at the bottom of its column
  const last = await prisma.meeting.aggregate({ where: { stateId }, _max: { position: true } })

  const row = await prisma.meeting.create({
    data: {
      ...data,
      emoji: emojiOrRandom(data.emoji),
      stateId,
      youtubers: { connect: creatorLinks(youtuberIds) },
      scheduledAt: readDate(values, 'scheduledAt'),
      position: (last._max.position ?? 0) + FORM_SETTINGS.positionStep,
      createdById: actorId,
      updatedById: actorId,
      attendees: { create: toAttendees(values) },
    },
    include: MEETING_INCLUDE,
  })

  return toMeetingSummary(row)
}

/**
 * Card of a calendar entry on the Réunions page
 * @typedef {Object} EntryMeeting
 * @property {string} title - Entry title
 * @property {string | null} emoji - Entry emoji
 * @property {Date} startsAt - Start of the entry
 * @property {Date | null} endsAt - End of the entry
 * @property {MeetingAudienceName} audience - Audience of the card
 * @property {string | null} youtuberId - Creator it concerns
 * @property {string[]} leadIds - Members running it
 * @property {string[]} participantIds - Members convened
 * @property {string} actorId - Who planned it
 */

export interface EntryMeeting {
  title: string
  emoji: string | null
  startsAt: Date
  endsAt: Date | null
  audience: MeetingAudienceName
  youtuberId: string | null
  leadIds: string[]
  participantIds: string[]
  actorId: string
}

/**
 * File a meeting on the Réunions page for a calendar entry
 * @param {EntryMeeting} entry - Entry to file
 * @return {Promise<string>} - Meeting identifier
 */

export const openMeetingForEntry = async (entry: EntryMeeting): Promise<string> => {
  const stateId = await defaultState(WorkflowScopes.Meeting)
  const last = await prisma.meeting.aggregate({ where: { stateId }, _max: { position: true } })
  const leads = [...new Set(entry.leadIds)]
  const participants = [...new Set(entry.participantIds)].filter((id) => !leads.includes(id))

  const row = await prisma.meeting.create({
    data: {
      title: entry.title,
      emoji: entry.emoji,
      scheduledAt: entry.startsAt,
      durationMin: entry.endsAt
        ? Math.round((entry.endsAt.getTime() - entry.startsAt.getTime()) / MINUTE_MS)
        : null,
      audience: entry.audience,
      stateId,
      youtubers: { connect: creatorLinks(entry.youtuberId ? [entry.youtuberId] : []) },
      position: (last._max.position ?? 0) + FORM_SETTINGS.positionStep,
      createdById: entry.actorId,
      updatedById: entry.actorId,
      attendees: {
        create: [
          ...leads.map((accountId) => ({ accountId, kind: AttendeeKinds.Lead })),
          ...participants.map((accountId) => ({ accountId, kind: AttendeeKinds.Participant })),
        ],
      },
    },
    select: { id: true },
  })

  return row.id
}

/**
 * Edit a meeting
 * @param {string} id - Meeting identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} actorId - Who edited it
 * @return {Promise<MeetingSummary>} - Updated card
 */

export const updateMeeting = async (
  id: string,
  values: FormValues,
  scope: AccessScope,
  actorId: string
): Promise<MeetingSummary> => {
  await assertRowInScope('meeting', id, scope)

  // The card of a series of annual reviews is filled in by the system, only its date can change
  const linked = await prisma.meeting.findUnique({
    where: { id },
    select: { project: { select: { systemKey: true } } },
  })
  if (linked?.project?.systemKey?.startsWith('annual-reviews:')) {
    const row = await prisma.meeting.update({
      where: { id },
      data: { scheduledAt: readDate(values, 'scheduledAt'), updatedById: actorId },
      include: MEETING_INCLUDE,
    })

    return toMeetingSummary(row)
  }

  const picked = readCreatorIds(values)
  assertAllInScope(scope, picked)

  const stored = await prisma.meeting.findUnique({
    where: { id },
    select: { youtubers: { select: { id: true } } },
  })

  // Attendees are replaced wholesale
  const row = await prisma.meeting.update({
    where: { id },
    data: {
      ...toMeetingData(values),
      scheduledAt: readDate(values, 'scheduledAt'),
      updatedById: actorId,
      youtubers: {
        set: creatorLinks(
          keptCreatorIds(
            picked,
            scope,
            stored?.youtubers.map((youtuber) => youtuber.id)
          )
        ),
      },
      attendees: { deleteMany: {}, create: toAttendees(values) },
    },
    include: MEETING_INCLUDE,
  })

  return toMeetingSummary(row)
}

/**
 * Drop a meeting
 * @param {string} id - Meeting identifier
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<void>} - Removed
 */

export const removeMeeting = async (id: string, scope: AccessScope): Promise<void> => {
  await assertRowInScope('meeting', id, scope)

  await prisma.meeting.delete({ where: { id } })
}

/**
 * Read one meeting file
 * @param {string} id - Meeting identifier
 * @return {Promise<MeetingDetail>} - Full file
 */

export const readMeeting = async (id: string): Promise<MeetingDetail> => {
  const row = await prisma.meeting.findUnique({ where: { id }, include: MEETING_INCLUDE })
  if (!row) throw notFound()

  const topics = await prisma.meetingTopic.findMany({
    where: { meetingId: id },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  })

  return { summary: toMeetingSummary(row), topics: topics.map(toTopic) }
}

/**
 * Read where a meeting sits on the calendar, none when it was never put there
 * @param {string} meetingId - Meeting identifier
 * @return {Promise<MeetingCalendarView | null>} - One entry, or a period with the slots of each day
 */

export const readMeetingCalendar = async (
  meetingId: string
): Promise<MeetingCalendarView | null> => {
  const linked = await prisma.calendarEvent.findMany({
    where: { meetingId },
    orderBy: { startsAt: 'asc' },
    select: { id: true, title: true, kind: true, startsAt: true, endsAt: true, projectId: true },
  })
  const first = linked[0]
  if (!first) return null

  // A period carries the slots filed under its project
  const period = linked.find((entry) => entry.kind === CalendarKinds.Period && entry.projectId)
  if (!period?.projectId) {
    return {
      shape: 'single',
      title: first.title,
      startsAt: first.startsAt.toISOString(),
      endsAt: first.endsAt?.toISOString() ?? null,
      entryId: first.id,
      days: [],
    }
  }

  const slots = await prisma.calendarEvent.findMany({
    where: { projectId: period.projectId, kind: CalendarKinds.Event },
    select: { startsAt: true, accountId: true },
  })
  const perDay = new Map<string, { taken: number; total: number }>()
  for (const slot of slots) {
    const day = instantToWall(slot.startsAt).slice(0, 10)
    const count = perDay.get(day) ?? { taken: 0, total: 0 }
    count.total += 1
    if (slot.accountId) count.taken += 1
    perDay.set(day, count)
  }

  return {
    shape: 'series',
    title: period.title,
    startsAt: period.startsAt.toISOString(),
    endsAt: period.endsAt?.toISOString() ?? null,
    entryId: period.id,
    days: [...perDay.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([day, count]) => ({ day, ...count })),
  }
}

/**
 * Stamp a meeting as edited
 * @param {string} id - Meeting identifier
 * @param {string} actorId - Who edited it
 * @return {Promise<void>} - Stamped
 */

export const touchMeeting = async (id: string, actorId: string): Promise<void> => {
  await prisma.meeting.update({ where: { id }, data: { updatedById: actorId } })
}

/**
 * Move a meeting card
 * @param {string} id - Meeting identifier
 * @param {string} stateId - Target column
 * @param {number} index - Drop index
 * @param {string} actorId - Who moved it
 * @return {Promise<MeetingSummary>} - Moved card
 */

export const moveMeeting = async (
  id: string,
  stateId: string,
  index: number,
  actorId: string
): Promise<MeetingSummary> => {
  const cards = await prisma.meeting.findMany({
    where: { stateId, id: { not: id } },
    select: { id: true, position: true },
    orderBy: { position: 'asc' },
  })

  const row = await prisma.meeting.update({
    where: { id },
    data: { stateId, position: positionAt(cards, index), updatedById: actorId },
    include: MEETING_INCLUDE,
  })

  return toMeetingSummary(row)
}
