import 'server-only'

import moment from 'moment'

import { prisma } from '@/core/lib/db'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { ACADEMY_STAGE_REGISTRY } from '@/declarations/academy/registries'
import { CALENDAR_PROJECTION_COPY } from '@/declarations/calendar/copy'
import { CALENDAR_SOURCE_REGISTRY } from '@/declarations/calendar/registries'
import { ROUTES } from '@/declarations/navigation'
import { MEETING_COPY } from '@/declarations/work/copy'
import type { PermissionHelpers } from '@/types/auth'
import type { CalendarEntry } from '@/types/calendar'
import type { AcademyStageName } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'
import {
  AbsenceStatuses,
  AttendeeKinds,
  CalendarKinds,
  CalendarSources,
  EventVisibilities,
} from '@/utils/constants/workflow'
import type { CalendarSourceName } from '@/utils/constants/workflow'

/**
 * Window a projection is read for
 * @typedef {Object} ProjectionContext
 * @property {Date} from - First moment shown
 * @property {Date} to - Last moment shown
 * @property {PermissionHelpers} access - Permission helpers
 * @property {AccessScope} scope - Creator perimeter
 */

export interface ProjectionContext {
  from: Date
  to: Date
  access: PermissionHelpers
  scope: AccessScope
}

// Functions carry the colour, so every projected member is read with both of theirs
const FUNCTION_SHAPE = {
  select: {
    displayName: true,
    primaryFunction: { select: { name: true, accent: true } },
    secondaryFunction: { select: { name: true, accent: true } },
  },
} as const

/**
 * Member a projected entry is about, the source of its colour
 * @typedef {Object} ProjectedMember
 * @property {string} displayName - Member name
 * @property {{ accent: string | null } | null} primaryFunction - Main post
 * @property {{ accent: string | null } | null} secondaryFunction - Second post
 */

export interface ProjectedMember {
  displayName: string
  primaryFunction: { name: string; accent: string | null } | null
  secondaryFunction: { name: string; accent: string | null } | null
}

/**
 * Read the post lending its colour to an entry, the main one before the second
 * @param {ProjectedMember | null | undefined} member - Member the entry is about
 * @return {{ name: string, accent: string } | null} - Post carrying a colour
 */

export const memberFunction = (
  member: ProjectedMember | null | undefined
): { name: string; accent: string } | null => {
  const posts = [member?.primaryFunction, member?.secondaryFunction]
  const carrying = posts.find((post) => post?.accent)

  return carrying?.accent ? { name: carrying.name, accent: carrying.accent } : null
}

/**
 * Read the colour a member lends to an entry, their function always winning
 * @param {ProjectedMember | null | undefined} member - Member the entry is about
 * @param {(string | null | undefined)[]} fallbacks - Colours tried when no function carries one
 * @return {string | null} - Colour to draw
 */

export const memberAccent = (
  member: ProjectedMember | null | undefined,
  ...fallbacks: (string | null | undefined)[]
): string | null =>
  memberFunction(member)?.accent ??
  fallbacks.find((accent) => accent !== null && accent !== undefined) ??
  null

/**
 * Shape a projected entry, read-only by construction
 * @param {Object} input - Projection input
 * @param {CalendarSourceName} input.source - Domain it came from
 * @param {string} input.id - Identifier in that domain
 * @param {string} input.title - Display title
 * @param {string | null} [input.emoji] - Glyph of the record
 * @param {Date} input.startsAt - First moment
 * @param {Date | null} input.endsAt - Last moment
 * @param {boolean} input.allDay - Spans whole days
 * @param {string | null} input.accent - Resolved colour
 * @param {string | null} input.description - Supporting text
 * @param {string | null} input.subjectName - Member it is about
 * @param {string} [input.legendLabel] - Legend row it belongs to
 * @param {string} [input.href] - Page of the record
 * @param {string} [input.body] - Markdown content of the record
 * @return {CalendarEntry} - Projected entry
 */

const projected = ({
  source,
  id,
  title,
  emoji,
  startsAt,
  endsAt,
  allDay,
  accent,
  description,
  subjectName,
  legendLabel,
  href,
  body,
}: {
  source: CalendarSourceName
  id: string
  title: string
  emoji?: string | null
  startsAt: Date
  endsAt: Date | null
  allDay: boolean
  accent: string | null
  description: string | null
  subjectName: string | null
  legendLabel?: string
  href?: string
  body?: string
}): CalendarEntry => {
  const meta = CALENDAR_SOURCE_REGISTRY.get(source)

  return {
    id: `${source.toLowerCase()}:${id}`,
    source,
    // Anything spanning whole days reads as a band, a dated moment reads as a card
    kind: allDay ? CalendarKinds.Period : CalendarKinds.Event,
    title,
    emoji: emoji ?? null,
    description,
    templateId: null,
    templateName: meta.label,
    accent: accent ?? meta.accent,
    legendLabel: legendLabel ?? meta.label,
    visibility: EventVisibilities.Everyone,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt?.toISOString() ?? null,
    allDay,
    ownerName: null,
    subjectName,
    href: href ?? null,
    body: body ?? null,
    readOnly: true,
    values: {},
  }
}

/**
 * Project the absences overlapping the window
 * @param {ProjectionContext} context - Window and permissions
 * @return {Promise<CalendarEntry[]>} - Projected absences
 */

export const absenceEntries = async ({
  from,
  to,
  access,
}: ProjectionContext): Promise<CalendarEntry[]> => {
  if (!access.can(Permissions.AbsenceRead)) return []

  // A pending absence is only a request, so only its reviewers see it coming
  const statuses = access.can(Permissions.AbsenceReview)
    ? [AbsenceStatuses.Approved, AbsenceStatuses.Pending]
    : [AbsenceStatuses.Approved]

  const rows = await prisma.absence.findMany({
    where: { status: { in: statuses }, startDate: { lte: to }, endDate: { gte: from } },
    include: { account: FUNCTION_SHAPE },
    orderBy: { startDate: 'asc' },
  })

  return rows.map((row) =>
    projected({
      source: CalendarSources.Absence,
      id: row.id,
      title: `${
        row.status === AbsenceStatuses.Pending
          ? CALENDAR_PROJECTION_COPY.pendingAbsence
          : CALENDAR_PROJECTION_COPY.absence
      } — ${row.account.displayName}`,
      startsAt: row.startDate,
      endsAt: row.endDate,
      allDay: true,
      accent: memberAccent(row.account),
      description: row.reason,
      subjectName: row.account.displayName,
      legendLabel: memberFunction(row.account)?.name,
    })
  )
}

/**
 * Lay a meeting's four content axes out as one markdown block
 * @param {Object} meeting - Meeting row with its topics
 * @param {string | null} meeting.introduction - Opening words
 * @param {string | null} meeting.outro - Closing words
 * @param {string | null} meeting.minutes - Meeting minutes
 * @param {Array<{ emoji: string, title: string, body: string | null }>} meeting.topics - Points covered
 * @return {string | undefined} - Markdown content, absent while every axis stays blank
 */

const meetingBody = (meeting: {
  introduction: string | null
  outro: string | null
  minutes: string | null
  topics: { emoji: string; title: string; body: string | null }[]
}): string | undefined => {
  const topics = meeting.topics.map((topic) =>
    [`### ${topic.emoji} ${topic.title}`, topic.body].filter(Boolean).join('\n\n')
  )

  const sections = [
    meeting.introduction && `## ${MEETING_COPY.introductionTitle}\n\n${meeting.introduction}`,
    topics.length > 0 && `## ${MEETING_COPY.topicsTitle}\n\n${topics.join('\n\n')}`,
    meeting.outro && `## ${MEETING_COPY.outroTitle}\n\n${meeting.outro}`,
    meeting.minutes && `## ${MEETING_COPY.minutesTitle}\n\n${meeting.minutes}`,
  ].filter((section): section is string => Boolean(section))

  return sections.length > 0 ? sections.join('\n\n') : undefined
}

/**
 * Project the meetings of the window that were not already posted by hand
 * @param {ProjectionContext} context - Window and permissions
 * @return {Promise<CalendarEntry[]>} - Projected meetings
 */

export const meetingEntries = async ({
  from,
  to,
  access,
  scope,
}: ProjectionContext): Promise<CalendarEntry[]> => {
  if (!access.can(Permissions.MeetingRead)) return []

  const rows = await prisma.meeting.findMany({
    where: scopedWhere('meeting', scope, {
      scheduledAt: { gte: from, lte: to },
      // A meeting already posted on the calendar is drawn from its own row, never twice
      calendarEvents: { none: {} },
    }),
    include: {
      attendees: {
        where: { kind: AttendeeKinds.Lead },
        take: 1,
        include: { account: FUNCTION_SHAPE },
      },
      topics: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] },
    },
    orderBy: { scheduledAt: 'asc' },
  })

  return rows.map((row) => {
    const lead = row.attendees[0]?.account ?? null

    return projected({
      source: CalendarSources.Meeting,
      id: row.id,
      title: row.title,
      emoji: row.emoji,
      startsAt: row.scheduledAt,
      endsAt: row.durationMin
        ? moment(row.scheduledAt).add(row.durationMin, 'minutes').toDate()
        : null,
      allDay: false,
      accent: memberAccent(lead),
      description: row.introduction,
      subjectName: lead?.displayName ?? null,
      legendLabel: memberFunction(lead)?.name,
      href: ROUTES.meeting(row.id),
      body: meetingBody(row),
    })
  })
}

/**
 * Project the birthdays falling inside the window, year after year
 * @param {ProjectionContext} context - Window and permissions
 * @return {Promise<CalendarEntry[]>} - Projected birthdays
 */

export const birthdayEntries = async ({
  from,
  to,
  access,
  scope,
}: ProjectionContext): Promise<CalendarEntry[]> => {
  if (!access.can(Permissions.MemberRead)) return []

  const rows = await prisma.account.findMany({
    where: scopedWhere('account', scope, {
      birthday: { not: null },
      celebrateBirthday: true,
      leftAt: null,
    }),
    select: { id: true, birthday: true, ...FUNCTION_SHAPE.select },
  })

  const start = moment(from).startOf('day')
  const end = moment(to).endOf('day')

  return rows.flatMap((row) => {
    const birthday = moment(row.birthday!)

    // A window can straddle a new year, so both candidate years are tried
    return [start.year(), end.year()]
      .filter((year, index, years) => years.indexOf(year) === index)
      .map((year) => birthday.clone().year(year))
      .filter((day) => day.isBetween(start, end, 'day', '[]'))
      .map((day) =>
        projected({
          source: CalendarSources.Birthday,
          id: `${row.id}:${day.year()}`,
          title: `${CALENDAR_PROJECTION_COPY.birthday} — ${row.displayName}`,
          startsAt: day.startOf('day').toDate(),
          endsAt: null,
          allDay: true,
          accent: memberAccent(row),
          description: null,
          subjectName: row.displayName,
          legendLabel: memberFunction(row)?.name,
        })
      )
  })
}

/**
 * Project the dated steps of one academy session
 * @param {ProjectionContext} context - Window and permissions
 * @param {string} sessionId - Session the board is bound to
 * @return {Promise<CalendarEntry[]>} - Projected steps
 */

export const academyStepEntries = async (
  { from, to, access }: ProjectionContext,
  sessionId: string
): Promise<CalendarEntry[]> => {
  if (!access.can(Permissions.AcademyRead)) return []

  const rows = await prisma.academyStep.findMany({
    where: { sessionId, scheduledAt: { gte: from, lte: to } },
    include: { junior: { include: { account: FUNCTION_SHAPE } } },
    orderBy: { scheduledAt: 'asc' },
  })

  return rows.map((row) => {
    const junior = row.junior?.account ?? null
    const stage = row.stage ? ACADEMY_STAGE_REGISTRY.get(row.stage as AcademyStageName) : null

    return projected({
      source: CalendarSources.AcademyStep,
      id: row.id,
      title: junior ? `${row.title} — ${junior.displayName}` : row.title,
      startsAt: row.scheduledAt ?? new Date(),
      endsAt: null,
      allDay: true,
      accent: memberAccent(junior, stage?.accent),
      description: row.notes,
      subjectName: junior?.displayName ?? null,
      legendLabel: memberFunction(junior)?.name,
    })
  })
}
