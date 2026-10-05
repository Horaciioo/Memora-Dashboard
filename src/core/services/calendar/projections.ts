import 'server-only'

import { prisma } from '@/core/lib/db'
import { endOfDay, startOfDay } from '@/utils/format/days'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { ACADEMY_STAGE_REGISTRY } from '@/declarations/academy/registries'
import { CALENDAR_PROJECTION_COPY } from '@/declarations/calendar/copy'
import { CALENDAR_SOURCE_REGISTRY } from '@/declarations/calendar/registries'
import { ROUTES } from '@/declarations/navigation'
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
import { byHierarchy } from '@/core/services/reference/functions'
import type { CalendarKindName, CalendarSourceName } from '@/utils/constants/workflow'

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

// Milliseconds in one day and one minute
const DAY_MS = 86_400_000
const MINUTE_MS = 60_000

// The creator a member works for carries the colour of everything they appear in
const FUNCTION_SHAPE = {
  select: {
    displayName: true,
    functions: {
      select: { jobFunction: { select: { name: true, accent: true, kind: true, position: true } } },
    },
    youtubers: { select: { id: true, accent: true }, orderBy: { position: 'asc' }, take: 1 },
  },
} as const

/**
 * Posts a member holds
 * @typedef {Object} ProjectedPosts
 * @property {Array<Object>} functions - Held functions with their name
 */

export interface ProjectedPosts {
  functions: {
    jobFunction: { name: string; accent: string | null; kind: string; position: number }
  }[]
}

/**
 * Member a projected entry is about
 * @typedef {Object} ProjectedMember
 * @property {string} displayName - Member name
 * @property {{ id: string, accent: string | null }[]} youtubers - Creator lending the colour
 */

export interface ProjectedMember extends ProjectedPosts {
  displayName: string
  youtubers: { id: string; accent: string | null }[]
}

/**
 * Read the post a member holds
 * @param {ProjectedPosts | null | undefined} member - Member the entry is about
 * @return {{ name: string, accent: string } | null} - Post carrying a colour
 */

export const memberFunction = (
  member: ProjectedPosts | null | undefined
): { name: string; accent: string } | null => {
  // Down the hierarchy
  const posts = (member?.functions ?? []).map((held) => held.jobFunction).sort(byHierarchy)
  const carrying = posts.find((post) => post.accent)

  return carrying?.accent ? { name: carrying.name, accent: carrying.accent } : null
}

/**
 * Read the creator colour a member lends to an entry
 * @param {ProjectedMember | null | undefined} member - Member the entry is about
 * @return {string | null} - Colour to draw
 */

export const creatorAccent = (member: ProjectedMember | null | undefined): string | null =>
  member?.youtubers[0]?.accent ?? null

/**
 * Read the creator a member works for
 * @param {ProjectedMember | null | undefined} member - Member the entry is about
 * @return {string | null} - Creator identifier
 */

export const creatorId = (member: ProjectedMember | null | undefined): string | null =>
  member?.youtubers[0]?.id ?? null

/**
 * Shape a projected entry
 * @param {Object} input - Projection input
 * @param {CalendarSourceName} input.source - Domain it came from
 * @param {string} input.id - Identifier in that domain
 * @param {string} input.title - Display title
 * @param {string | null} [input.emoji] - Glyph of the record
 * @param {Date} input.startsAt - First moment
 * @param {Date | null} input.endsAt - Last moment
 * @param {boolean} input.allDay - Spans whole days
 * @param {string | null} input.accent - Resolved colour
 * @param {string | null} [input.youtuberId] - Creator it belongs to
 * @param {string | null} input.description - Supporting text
 * @param {string | null} input.subjectName - Member it is about
 * @param {CalendarKindName} [input.kind] - Shape it draws as
 * @param {boolean} [input.muted] - Drawn in retreat
 * @param {string} [input.href] - Page of the record
 * @param {string} [input.body] - Markdown content of the record
 * @param {{ emoji: string | null, title: string }[]} [input.topics] - Meeting subject titles
 * @param {string | null} [input.minutes] - Meeting write-up
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
  youtuberId,
  description,
  subjectName,
  kind,
  muted,
  href,
  body,
  topics,
  minutes,
}: {
  source: CalendarSourceName
  id: string
  title: string
  emoji?: string | null
  startsAt: Date
  endsAt: Date | null
  allDay: boolean
  accent: string | null
  youtuberId?: string | null
  description: string | null
  subjectName: string | null
  kind?: CalendarKindName
  muted?: boolean
  href?: string
  body?: string
  topics?: { emoji: string | null; title: string }[]
  minutes?: string | null
}): CalendarEntry => {
  const meta = CALENDAR_SOURCE_REGISTRY.get(source)

  return {
    id: `${source.toLowerCase()}:${id}`,
    source,
    // Anything spanning whole days reads as a band
    kind: kind ?? (allDay ? CalendarKinds.Period : CalendarKinds.Event),
    title,
    emoji: emoji ?? null,
    description,
    templateId: null,
    templateName: meta.label,
    accent,
    youtuberId: youtuberId ?? null,
    muted: muted ?? false,
    visibility: EventVisibilities.Everyone,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt?.toISOString() ?? null,
    allDay,
    ownerName: null,
    subjectName,
    href: href ?? null,
    body: body ?? null,
    topics,
    minutes,
    readOnly: true,
    rollCall: false,
    rosterShared: false,
    attendance: null,
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

  // A pending absence is only a request
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
      } · ${row.account.displayName}`,
      startsAt: row.startDate,
      endsAt: row.endDate,
      allDay: true,
      // An absence is background information
      kind: CalendarKinds.Event,
      muted: true,
      accent: null,
      youtuberId: creatorId(row.account),
      description: row.reason,
      subjectName: row.account.displayName,
    })
  )
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
      // A meeting already posted on the calendar is drawn from its own row
      calendarEvents: { none: {} },
    }),
    include: {
      attendees: {
        where: { kind: AttendeeKinds.Lead },
        take: 1,
        include: { account: FUNCTION_SHAPE },
      },
      topics: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] },
      youtuber: { select: { accent: true } },
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
        ? new Date(row.scheduledAt.getTime() + row.durationMin * MINUTE_MS)
        : null,
      allDay: false,
      accent: row.youtuber?.accent ?? creatorAccent(lead),
      youtuberId: row.youtuberId ?? creatorId(lead),
      // A planned meeting shows nothing of its content
      description: null,
      subjectName: lead?.displayName ?? null,
      href: ROUTES.meeting(row.id),
      topics: row.topics.map((topic) => ({ emoji: topic.emoji, title: topic.title })),
      minutes: row.minutes,
    })
  })
}

/**
 * One celebrated birthday landing inside a window
 * @typedef {Object} BirthdayOccurrence
 * @property {string} accountId - Member identifier
 * @property {string} displayName - Member name
 * @property {string | null} avatarUrl - Member portrait
 * @property {Date} day - Day it falls on
 * @property {string | null} accent - Creator colour
 * @property {string | null} youtuberId - Creator it belongs to
 */

export interface BirthdayOccurrence {
  accountId: string
  displayName: string
  avatarUrl: string | null
  day: Date
  accent: string | null
  youtuberId: string | null
}

/**
 * Read the celebrated birthdays of a window
 * @param {Date} from - First moment
 * @param {Date} to - Last moment
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<BirthdayOccurrence[]>} - Occurrences
 */

export const birthdaysBetween = async (
  from: Date,
  to: Date,
  scope: AccessScope
): Promise<BirthdayOccurrence[]> => {
  /*
   * Postgres narrows the candidates
   */

  const dayKey = (date: Date): number => (date.getMonth() + 1) * 100 + date.getDate()

  // Widened by a day each side
  const fromKey = dayKey(new Date(from.getTime() - DAY_MS))
  const toKey = dayKey(new Date(to.getTime() + DAY_MS))

  const candidates = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM accounts
    WHERE birthday IS NOT NULL
      AND "celebrateBirthday" = true
      AND "leftAt" IS NULL
      AND CASE
        WHEN ${fromKey} <= ${toKey}
          THEN (EXTRACT(MONTH FROM birthday) * 100 + EXTRACT(DAY FROM birthday))
               BETWEEN ${fromKey} AND ${toKey}
        ELSE (EXTRACT(MONTH FROM birthday) * 100 + EXTRACT(DAY FROM birthday)) >= ${fromKey}
          OR (EXTRACT(MONTH FROM birthday) * 100 + EXTRACT(DAY FROM birthday)) <= ${toKey}
      END
  `

  if (candidates.length === 0) return []

  const rows = await prisma.account.findMany({
    where: scopedWhere('account', scope, { id: { in: candidates.map((row) => row.id) } }),
    select: { id: true, birthday: true, avatarUrl: true, ...FUNCTION_SHAPE.select },
  })

  const start = startOfDay(new Date(from))
  const end = endOfDay(new Date(to))

  return rows
    .flatMap((row) => {
      const birthday = row.birthday as Date

      // A window can straddle a new year
      return [start.getFullYear(), end.getFullYear()]
        .filter((year, index, years) => years.indexOf(year) === index)
        .map((year) => new Date(year, birthday.getMonth(), birthday.getDate()))
        .filter((day) => day >= start && day <= end)
        .map((day) => ({
          accountId: row.id,
          displayName: row.displayName,
          avatarUrl: row.avatarUrl,
          day,
          accent: creatorAccent(row),
          youtuberId: creatorId(row),
        }))
    })
    .sort((left, right) => left.day.getTime() - right.day.getTime())
}

/**
 * Project the birthdays falling inside the window
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

  const occurrences = await birthdaysBetween(from, to, scope)

  return occurrences.map((occurrence) =>
    projected({
      source: CalendarSources.Birthday,
      id: `${occurrence.accountId}:${occurrence.day.getFullYear()}`,
      title: `${CALENDAR_PROJECTION_COPY.birthday} · ${occurrence.displayName}`,
      startsAt: occurrence.day,
      endsAt: null,
      allDay: true,
      accent: occurrence.accent,
      youtuberId: occurrence.youtuberId,
      description: null,
      subjectName: occurrence.displayName,
    })
  )
}

/**
 * Project the dated steps of the academy
 * @param {ProjectionContext} context - Window and permissions
 * @param {string} [sessionId] - Session the board is bound to
 * @return {Promise<CalendarEntry[]>} - Projected steps
 */

export const academyStepEntries = async (
  { from, to, access, scope }: ProjectionContext,
  sessionId?: string
): Promise<CalendarEntry[]> => {
  if (!access.can(Permissions.AcademyRead)) return []

  const rows = await prisma.academyStep.findMany({
    where: {
      ...(sessionId ? { sessionId } : {}),
      scheduledAt: { gte: from, lte: to },
      // A creator's perimeter only reaches the juniors that work for it
      ...(!sessionId && !scope.isGlobal
        ? { junior: { account: { youtubers: { some: { id: { in: scope.youtuberIds } } } } } }
        : {}),
    },
    include: { junior: { include: { account: FUNCTION_SHAPE } } },
    orderBy: { scheduledAt: 'asc' },
  })

  return rows.map((row) => {
    const junior = row.junior?.account ?? null
    const stage = row.stage ? ACADEMY_STAGE_REGISTRY.get(row.stage as AcademyStageName) : null

    return projected({
      source: CalendarSources.AcademyStep,
      id: row.id,
      title: junior ? `${row.title} · ${junior.displayName}` : row.title,
      startsAt: row.scheduledAt ?? new Date(),
      endsAt: null,
      allDay: true,
      accent: creatorAccent(junior) ?? stage?.accent ?? null,
      youtuberId: creatorId(junior),
      description: row.notes,
      subjectName: junior?.displayName ?? null,
    })
  })
}

/**
 * Project the running length of every academy session in the window
 * @param {ProjectionContext} context - Window and permissions
 * @return {Promise<CalendarEntry[]>} - Projected sessions
 */

export const academySessionEntries = async ({
  from,
  to,
  access,
}: ProjectionContext): Promise<CalendarEntry[]> => {
  if (!access.can(Permissions.AcademyRead)) return []

  const rows = await prisma.academySession.findMany({
    where: {
      startsAt: { lte: to },
      OR: [{ endsAt: { gte: from } }, { endsAt: null, startsAt: { gte: from } }],
    },
    include: { jobFunction: { select: { name: true, accent: true } } },
    orderBy: { startsAt: 'asc' },
  })

  return rows.map((row) =>
    projected({
      source: CalendarSources.AcademySession,
      id: row.id,
      title: `${CALENDAR_PROJECTION_COPY.academySession} · ${row.jobFunction.name}`,
      startsAt: row.startsAt,
      endsAt: row.endsAt ?? row.startsAt,
      allDay: true,
      kind: CalendarKinds.Period,
      accent: row.jobFunction.accent,
      description: row.summary,
      subjectName: null,
      href: ROUTES.session(row.id),
    })
  )
}

/**
 * Project the recruitment campaigns open in the window
 * @param {ProjectionContext} context - Window and permissions
 * @return {Promise<CalendarEntry[]>} - Projected sessions and interviews
 */

export const recruitmentEntries = async ({
  from,
  to,
  access,
  scope,
}: ProjectionContext): Promise<CalendarEntry[]> => {
  if (!access.can(Permissions.RecruitmentRead)) return []

  const [sessions, candidates] = await Promise.all([
    prisma.recruitmentSession.findMany({
      where: scopedWhere('recruitmentSession', scope, {
        opensAt: { not: null, lte: to },
        OR: [{ closesAt: { gte: from } }, { closesAt: null, opensAt: { gte: from } }],
      }),
      include: { youtuber: { select: { accent: true } } },
      orderBy: { opensAt: 'asc' },
    }),
    prisma.recruitmentCandidate.findMany({
      where: {
        interviewAt: { gte: from, lte: to },
        session: scopedWhere('recruitmentSession', scope),
      },
      include: {
        session: { select: { id: true, youtuberId: true, youtuber: { select: { accent: true } } } },
      },
      orderBy: { interviewAt: 'asc' },
    }),
  ])

  const campaigns = sessions.map((row) =>
    projected({
      source: CalendarSources.Recruitment,
      id: row.id,
      title: row.name,
      startsAt: row.opensAt as Date,
      endsAt: row.closesAt ?? (row.opensAt as Date),
      allDay: true,
      kind: CalendarKinds.Period,
      accent: row.youtuber.accent,
      youtuberId: row.youtuberId,
      description: row.summary,
      subjectName: null,
      href: ROUTES.recruitment(row.id),
    })
  )

  const interviews = candidates.map((row) =>
    projected({
      source: CalendarSources.RecruitmentInterview,
      id: row.id,
      title: `${CALENDAR_PROJECTION_COPY.interview} · ${row.displayName ?? row.discordId}`,
      startsAt: row.interviewAt as Date,
      endsAt: null,
      allDay: false,
      accent: row.session.youtuber.accent,
      youtuberId: row.session.youtuberId,
      description: null,
      subjectName: row.displayName,
      href: ROUTES.recruitment(row.session.id),
    })
  )

  return [...campaigns, ...interviews]
}
