import 'server-only'

import { prisma } from '@/core/lib/db'
import { assertInScope, assertRowInScope, scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { notFound } from '@/core/lib/errors'
import { readDate, readList, readNumberValue, readText } from '@/core/lib/forms/values'
import {
  AUTHORSHIP_INCLUDE,
  defaultState,
  memberOptions,
  positionAt,
  projectOptions,
  stateOptions,
  toAuthorship,
  toPerson,
  toTag,
  youtuberOptions,
} from '@/core/services/work/shared'
import { EMOJI_SETTINGS, FORM_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import { MEETING_FIELD_COPY } from '@/declarations/work/copy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { MeetingDetail, MeetingSummary, MeetingTopicEntry, WorkPerson } from '@/types/work'
import { AttendeeKinds, WorkflowScopes } from '@/utils/constants/workflow'
import type { AttendeeKindName } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

// Relations every meeting card needs
const MEETING_INCLUDE = {
  state: true,
  youtuber: true,
  project: true,
  attendees: { include: { account: true } },
  ...AUTHORSHIP_INCLUDE,
} satisfies Prisma.MeetingInclude

type MeetingRow = Prisma.MeetingGetPayload<{ include: typeof MEETING_INCLUDE }>

/**
 * Keep the attendees holding one seat kind
 * @param {MeetingRow} row - Meeting row with its attendees
 * @param {AttendeeKindName} kind - Seat kind
 * @return {WorkPerson[]} - Attendees
 */

const seats = (row: MeetingRow, kind: AttendeeKindName): WorkPerson[] =>
  row.attendees
    .filter((attendee) => attendee.kind === kind)
    .map((attendee) => toPerson(attendee.account))
    .filter((person) => person !== null)

/**
 * Map a meeting row to its card shape
 * @param {MeetingRow} row - Meeting row with its references
 * @return {MeetingSummary} - Board card
 */

const toSummary = (row: MeetingRow): MeetingSummary => ({
  ...toAuthorship(row),
  id: row.id,
  title: row.title,
  emoji: row.emoji,
  introduction: row.introduction,
  outro: row.outro,
  minutes: row.minutes,
  columnId: row.stateId,
  state: toTag(row.state),
  youtuber: toTag(row.youtuber),
  project: row.project ? { id: row.project.id, label: row.project.title, accent: null } : null,
  scheduledAt: row.scheduledAt.toISOString(),
  durationMin: row.durationMin,
  leads: seats(row, AttendeeKinds.Lead),
  assistants: seats(row, AttendeeKinds.Assistant),
  participants: seats(row, AttendeeKinds.Participant),
  position: row.position,
  values: {
    title: row.title,
    emoji: row.emoji,
    scheduledAt: row.scheduledAt.toISOString().slice(0, 16),
    durationMin: row.durationMin,
    stateId: row.stateId,
    youtuberId: row.youtuberId,
    projectId: row.projectId,
    leadIds: seats(row, AttendeeKinds.Lead).map((person) => person.id),
    assistantIds: seats(row, AttendeeKinds.Assistant).map((person) => person.id),
    participantIds: seats(row, AttendeeKinds.Participant).map((person) => person.id),
    introduction: row.introduction,
    outro: row.outro,
    minutes: row.minutes,
  },
})

/**
 * Build the meeting form declarations
 * @param {AccessScope} [scope] - Creator perimeter
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const meetingFields = async (scope?: AccessScope): Promise<FieldDefinition[]> => {
  const [states, youtubers, projects, members] = await Promise.all([
    stateOptions(WorkflowScopes.Meeting),
    youtuberOptions(scope),
    projectOptions(),
    memberOptions(scope),
  ])

  return [
    {
      name: 'emoji',
      kind: 'emoji',
      label: MEETING_FIELD_COPY.emoji,
      maxLength: EMOJI_SETTINGS.maxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'title',
      kind: 'text',
      label: MEETING_FIELD_COPY.title,
      required: true,
      glyph: 'emoji',
      maxLength: FORM_SETTINGS.titleMaxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'scheduledAt',
      kind: 'datetime',
      label: MEETING_FIELD_COPY.scheduledAt,
      required: true,
      span: 'half',
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'durationMin',
      kind: 'number',
      label: MEETING_FIELD_COPY.durationMin,
      min: FORM_SETTINGS.meetingMinDuration,
      max: FORM_SETTINGS.meetingMaxDuration,
      span: 'half',
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'leadIds',
      kind: 'multiselect',
      label: MEETING_FIELD_COPY.leads,
      placeholder: MEETING_FIELD_COPY.peopleEmpty,
      options: members,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'assistantIds',
      kind: 'multiselect',
      label: MEETING_FIELD_COPY.assistants,
      placeholder: MEETING_FIELD_COPY.peopleEmpty,
      options: members,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'participantIds',
      kind: 'multiselect',
      label: MEETING_FIELD_COPY.participants,
      placeholder: MEETING_FIELD_COPY.peopleEmpty,
      options: members,
      mark: 'avatar',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'youtuberId',
      kind: 'select',
      label: MEETING_FIELD_COPY.youtuber,
      options: youtubers,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'projectId',
      kind: 'select',
      label: MEETING_FIELD_COPY.project,
      options: projects,
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'stateId',
      kind: 'select',
      label: MEETING_FIELD_COPY.state,
      options: states,
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.details,
    },
    {
      name: 'introduction',
      kind: 'markdown',
      label: MEETING_FIELD_COPY.introduction,
      maxLength: FORM_SETTINGS.markdownMaxLength,
      group: FORM_GROUPS.details,
    },
    {
      name: 'outro',
      kind: 'markdown',
      label: MEETING_FIELD_COPY.outro,
      maxLength: FORM_SETTINGS.markdownMaxLength,
      group: FORM_GROUPS.details,
    },
    {
      name: 'minutes',
      kind: 'markdown',
      label: MEETING_FIELD_COPY.minutes,
      maxLength: FORM_SETTINGS.markdownMaxLength,
      group: FORM_GROUPS.details,
    },
  ]
}

/**
 * Read every meeting
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<MeetingSummary[]>} - Board cards
 */

export const listMeetings = async (scope: AccessScope): Promise<MeetingSummary[]> => {
  const rows = await prisma.meeting.findMany({
    where: scopedWhere('meeting', scope, {}),
    include: MEETING_INCLUDE,
    orderBy: [{ scheduledAt: 'desc' }],
  })

  return rows.map(toSummary)
}

/**
 * Build the attendee rows of a meeting
 * @param {FormValues} values - Parsed body
 * @return {Array<{ accountId: string, kind: AttendeeKindName }>} - Attendee rows
 */

const toAttendees = (values: FormValues) => {
  const seen = new Set<string>()

  // A member holds one seat only, the strongest kind wins
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
  stateId: readText(values, 'stateId'),
  youtuberId: readText(values, 'youtuberId'),
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
  assertInScope(scope, data.youtuberId ?? null)

  const stateId = data.stateId ?? (await defaultState(WorkflowScopes.Meeting))

  // A new card lands at the bottom of its column
  const last = await prisma.meeting.aggregate({ where: { stateId }, _max: { position: true } })

  const row = await prisma.meeting.create({
    data: {
      ...data,
      stateId,
      scheduledAt: readDate(values, 'scheduledAt') ?? new Date(),
      position: (last._max.position ?? 0) + FORM_SETTINGS.positionStep,
      createdById: actorId,
      updatedById: actorId,
      attendees: { create: toAttendees(values) },
    },
    include: MEETING_INCLUDE,
  })

  return toSummary(row)
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

  const scheduledAt = readDate(values, 'scheduledAt')

  // Attendees are replaced wholesale, the form always sends the full lists
  const row = await prisma.meeting.update({
    where: { id },
    data: {
      ...toMeetingData(values),
      scheduledAt: scheduledAt ?? undefined,
      updatedById: actorId,
      attendees: { deleteMany: {}, create: toAttendees(values) },
    },
    include: MEETING_INCLUDE,
  })

  return toSummary(row)
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
 * Map a topic row to its display shape
 * @param {Prisma.MeetingTopicGetPayload<object>} row - Topic row
 * @return {MeetingTopicEntry} - Point covered
 */

const toTopic = (row: Prisma.MeetingTopicGetPayload<object>): MeetingTopicEntry => ({
  id: row.id,
  emoji: row.emoji,
  title: row.title,
  body: row.body,
  position: row.position,
  values: { emoji: row.emoji, title: row.title, body: row.body },
})

/**
 * Build the topic form declarations
 * @return {FieldDefinition[]} - Field declarations
 */

export const topicFields = (): FieldDefinition[] => [
  {
    name: 'emoji',
    kind: 'emoji',
    label: MEETING_FIELD_COPY.topicEmoji,
    required: true,
    maxLength: EMOJI_SETTINGS.maxLength,
  },
  {
    name: 'title',
    kind: 'text',
    label: MEETING_FIELD_COPY.topicTitle,
    required: true,
    glyph: 'emoji',
    maxLength: FORM_SETTINGS.titleMaxLength,
  },
  {
    name: 'body',
    kind: 'markdown',
    label: MEETING_FIELD_COPY.topicBody,
    maxLength: FORM_SETTINGS.markdownMaxLength,
  },
]

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

  return { summary: toSummary(row), topics: topics.map(toTopic) }
}

/**
 * Read the topics of one meeting
 * @param {string} meetingId - Meeting identifier
 * @return {Promise<MeetingTopicEntry[]>} - Points covered
 */

export const listTopics = async (meetingId: string): Promise<MeetingTopicEntry[]> => {
  const rows = await prisma.meetingTopic.findMany({
    where: { meetingId },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  })

  return rows.map(toTopic)
}

/**
 * Open a topic on a meeting
 * @param {string} meetingId - Meeting identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<MeetingTopicEntry>} - Created topic
 */

export const addTopic = async (
  meetingId: string,
  values: FormValues
): Promise<MeetingTopicEntry> => {
  // Topics keep their own order inside the meeting
  const last = await prisma.meetingTopic.aggregate({
    where: { meetingId },
    _max: { position: true },
  })

  const row = await prisma.meetingTopic.create({
    data: {
      meetingId,
      emoji: readText(values, 'emoji') ?? '',
      title: readText(values, 'title') ?? '',
      body: readText(values, 'body'),
      position: (last._max.position ?? 0) + FORM_SETTINGS.positionStep,
    },
  })

  return toTopic(row)
}

/**
 * Edit a topic
 * @param {string} id - Topic identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<MeetingTopicEntry>} - Updated topic
 */

export const updateTopic = async (id: string, values: FormValues): Promise<MeetingTopicEntry> => {
  const row = await prisma.meetingTopic.update({
    where: { id },
    data: {
      emoji: readText(values, 'emoji') ?? '',
      title: readText(values, 'title') ?? '',
      body: readText(values, 'body'),
    },
  })

  return toTopic(row)
}

/**
 * Drop a topic
 * @param {string} id - Topic identifier
 * @return {Promise<void>} - Removed
 */

export const removeTopic = async (id: string): Promise<void> => {
  await prisma.meetingTopic.delete({ where: { id } })
}

/**
 * Stamp a meeting as edited, its topics being part of its own content
 * @param {string} id - Meeting identifier
 * @param {string} actorId - Who edited it
 * @return {Promise<void>} - Stamped
 */

export const touchMeeting = async (id: string, actorId: string): Promise<void> => {
  await prisma.meeting.update({ where: { id }, data: { updatedById: actorId } })
}

/**
 * Read the meeting a topic belongs to
 * @param {string} id - Topic identifier
 * @return {Promise<string>} - Meeting identifier
 */

export const topicMeetingId = async (id: string): Promise<string> => {
  const row = await prisma.meetingTopic.findUnique({ where: { id }, select: { meetingId: true } })
  if (!row) throw notFound()

  return row.meetingId
}

/**
 * Read one meeting topic
 * @param {string} id - Topic identifier
 * @return {Promise<MeetingTopicEntry>} - Point covered
 */

export const readTopic = async (id: string): Promise<MeetingTopicEntry> => {
  const row = await prisma.meetingTopic.findUnique({ where: { id } })
  if (!row) throw notFound()

  return toTopic(row)
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

  return toSummary(row)
}
