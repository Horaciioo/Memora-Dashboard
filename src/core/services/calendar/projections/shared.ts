import 'server-only'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import type { WorkViewer } from '@/core/services/work/visibility'
import { CALENDAR_SOURCE_REGISTRY } from '@/declarations/calendar/registries'
import type { PermissionHelpers } from '@/types/auth'
import type { CalendarEntry } from '@/types/calendar'
import { CalendarKinds, EventVisibilities } from '@/utils/constants/workflow'
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
  viewer: WorkViewer
}

// The creator a member works for carries the colour of everything they appear in
export const FUNCTION_SHAPE = {
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

export const projected = ({
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
  mine,
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
  mine?: boolean
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
    mine,
    readOnly: true,
    rollCall: false,
    attendance: null,
    values: {},
  }
}
