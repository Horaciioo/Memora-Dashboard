import 'server-only'
import { isBehindDeadline } from '@/core/lib/work'
import {
  AUTHORSHIP_INCLUDE,
  toAuthorship,
  toCreatorTags,
  toPerson,
  toProjectTag,
  toTag,
  YOUTUBERS_INCLUDE,
} from '@/core/services/work/shared'
import type { MeetingSummary, WorkPerson } from '@/types/work'
import { AttendeeKinds } from '@/utils/constants/workflow'
import type { AttendeeKindName } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

// Relations every meeting card needs
export const MEETING_INCLUDE = {
  state: true,
  youtubers: YOUTUBERS_INCLUDE,
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

export const toMeetingSummary = (row: MeetingRow): MeetingSummary => ({
  ...toAuthorship(row),
  id: row.id,
  title: row.title,
  emoji: row.emoji,
  introduction: row.introduction,
  outro: row.outro,
  minutes: row.minutes,
  columnId: row.stateId,
  state: toTag(row.state),
  youtubers: toCreatorTags(row.youtubers),
  project: toProjectTag(row.project),
  scheduledAt: row.scheduledAt?.toISOString() ?? null,
  isOverdue: isBehindDeadline(row.scheduledAt, row.state?.phase),
  durationMin: row.durationMin,
  audience: row.audience,
  leads: seats(row, AttendeeKinds.Lead),
  assistants: seats(row, AttendeeKinds.Assistant),
  participants: seats(row, AttendeeKinds.Participant),
  position: row.position,
  values: {
    title: row.title,
    emoji: row.emoji,
    scheduledAt: row.scheduledAt?.toISOString() ?? null,
    durationMin: row.durationMin,
    audience: row.audience,
    stateId: row.stateId,
    youtuberIds: row.youtubers.map((youtuber) => youtuber.id),
    projectId: row.projectId,
    leadIds: seats(row, AttendeeKinds.Lead).map((person) => person.id),
    assistantIds: seats(row, AttendeeKinds.Assistant).map((person) => person.id),
    participantIds: seats(row, AttendeeKinds.Participant).map((person) => person.id),
    introduction: row.introduction,
    outro: row.outro,
    minutes: row.minutes,
  },
})
