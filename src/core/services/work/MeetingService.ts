import 'server-only'

import { prisma } from '@/core/lib/db'
import { readDate, readList, readNumberValue, readText } from '@/core/lib/forms/values'
import {
  defaultState,
  memberOptions,
  positionAt,
  projectOptions,
  stateOptions,
  toPerson,
  toTag,
  youtuberOptions,
} from '@/core/services/work/shared'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { MEETING_FIELD_COPY } from '@/declarations/work/copy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { MeetingSummary, WorkPerson } from '@/types/work'
import { AttendeeKinds, WorkflowScopes } from '@/utils/constants/workflow'
import type { AttendeeKindName } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

// Relations every meeting card needs
const MEETING_INCLUDE = {
  state: true,
  youtuber: true,
  project: true,
  attendees: { include: { account: true } },
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
  id: row.id,
  title: row.title,
  agenda: row.agenda,
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
    scheduledAt: row.scheduledAt.toISOString().slice(0, 16),
    durationMin: row.durationMin,
    stateId: row.stateId,
    youtuberId: row.youtuberId,
    projectId: row.projectId,
    leadIds: seats(row, AttendeeKinds.Lead).map((person) => person.id),
    assistantIds: seats(row, AttendeeKinds.Assistant).map((person) => person.id),
    participantIds: seats(row, AttendeeKinds.Participant).map((person) => person.id),
    agenda: row.agenda,
    minutes: row.minutes,
  },
})

/**
 * Build the meeting form declarations
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const meetingFields = async (): Promise<FieldDefinition[]> => {
  const [states, youtubers, projects, members] = await Promise.all([
    stateOptions(WorkflowScopes.Meeting),
    youtuberOptions(),
    projectOptions(),
    memberOptions(),
  ])

  return [
    {
      name: 'title',
      kind: 'text',
      label: MEETING_FIELD_COPY.title,
      required: true,
      maxLength: FORM_SETTINGS.titleMaxLength,
    },
    {
      name: 'scheduledAt',
      kind: 'datetime',
      label: MEETING_FIELD_COPY.scheduledAt,
      required: true,
      span: 'half',
    },
    {
      name: 'durationMin',
      kind: 'number',
      label: MEETING_FIELD_COPY.durationMin,
      min: FORM_SETTINGS.meetingMinDuration,
      max: FORM_SETTINGS.meetingMaxDuration,
      span: 'half',
    },
    {
      name: 'stateId',
      kind: 'select',
      label: MEETING_FIELD_COPY.state,
      options: states,
      span: 'half',
    },
    {
      name: 'youtuberId',
      kind: 'select',
      label: MEETING_FIELD_COPY.youtuber,
      options: youtubers,
      span: 'half',
    },
    {
      name: 'projectId',
      kind: 'select',
      label: MEETING_FIELD_COPY.project,
      options: projects,
      span: 'half',
    },
    {
      name: 'leadIds',
      kind: 'multiselect',
      label: MEETING_FIELD_COPY.leads,
      placeholder: MEETING_FIELD_COPY.peopleEmpty,
      options: members,
      span: 'half',
    },
    {
      name: 'assistantIds',
      kind: 'multiselect',
      label: MEETING_FIELD_COPY.assistants,
      placeholder: MEETING_FIELD_COPY.peopleEmpty,
      options: members,
      span: 'half',
    },
    {
      name: 'participantIds',
      kind: 'multiselect',
      label: MEETING_FIELD_COPY.participants,
      placeholder: MEETING_FIELD_COPY.peopleEmpty,
      options: members,
    },
    {
      name: 'agenda',
      kind: 'markdown',
      label: MEETING_FIELD_COPY.agenda,
      maxLength: FORM_SETTINGS.markdownMaxLength,
    },
    {
      name: 'minutes',
      kind: 'markdown',
      label: MEETING_FIELD_COPY.minutes,
      maxLength: FORM_SETTINGS.markdownMaxLength,
    },
  ]
}

/**
 * Read every meeting
 * @return {Promise<MeetingSummary[]>} - Board cards
 */

export const listMeetings = async (): Promise<MeetingSummary[]> => {
  const rows = await prisma.meeting.findMany({
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
  agenda: readText(values, 'agenda'),
  minutes: readText(values, 'minutes'),
  durationMin: readNumberValue(values, 'durationMin'),
  stateId: readText(values, 'stateId'),
  youtuberId: readText(values, 'youtuberId'),
  projectId: readText(values, 'projectId'),
})

/**
 * Plan a meeting
 * @param {FormValues} values - Parsed body
 * @return {Promise<MeetingSummary>} - Created card
 */

export const createMeeting = async (values: FormValues): Promise<MeetingSummary> => {
  const data = toMeetingData(values)
  const stateId = data.stateId ?? (await defaultState(WorkflowScopes.Meeting))

  const row = await prisma.meeting.create({
    data: {
      ...data,
      stateId,
      scheduledAt: readDate(values, 'scheduledAt') ?? new Date(),
      position: Date.now(),
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
 * @return {Promise<MeetingSummary>} - Updated card
 */

export const updateMeeting = async (id: string, values: FormValues): Promise<MeetingSummary> => {
  const scheduledAt = readDate(values, 'scheduledAt')

  // Attendees are replaced wholesale, the form always sends the full lists
  const row = await prisma.meeting.update({
    where: { id },
    data: {
      ...toMeetingData(values),
      scheduledAt: scheduledAt ?? undefined,
      attendees: { deleteMany: {}, create: toAttendees(values) },
    },
    include: MEETING_INCLUDE,
  })

  return toSummary(row)
}

/**
 * Drop a meeting
 * @param {string} id - Meeting identifier
 * @return {Promise<void>} - Removed
 */

export const removeMeeting = async (id: string): Promise<void> => {
  await prisma.meeting.delete({ where: { id } })
}

/**
 * Move a meeting card
 * @param {string} id - Meeting identifier
 * @param {string} stateId - Target column
 * @param {number} index - Drop index
 * @return {Promise<MeetingSummary>} - Moved card
 */

export const moveMeeting = async (
  id: string,
  stateId: string,
  index: number
): Promise<MeetingSummary> => {
  const cards = await prisma.meeting.findMany({
    where: { stateId, id: { not: id } },
    select: { id: true, position: true },
    orderBy: { position: 'asc' },
  })

  const row = await prisma.meeting.update({
    where: { id },
    data: { stateId, position: positionAt(cards, index) },
    include: MEETING_INCLUDE,
  })

  return toSummary(row)
}
