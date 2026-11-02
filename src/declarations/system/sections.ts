import { ROUTES } from '@/declarations/navigation'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Collaborative section with shared presence
 * @typedef {Object} PresenceSection
 * @property {string} id - Room key
 * @property {string} prefix - Route prefix
 * @property {PermissionName[]} permissions - Any one opens it
 */

export interface PresenceSection {
  id: string
  prefix: string
  permissions: PermissionName[]
}

/**
 * Sections whose banner shows who else is here
 * @type {readonly PresenceSection[]}
 */

export const PRESENCE_SECTIONS: readonly PresenceSection[] = [
  { id: 'members', prefix: ROUTES.members, permissions: [Permissions.MemberRead] },
  { id: 'projects', prefix: ROUTES.projects, permissions: [Permissions.ProjectRead] },
  { id: 'tasks', prefix: ROUTES.tasks, permissions: [Permissions.TaskRead] },
  { id: 'meetings', prefix: ROUTES.meetings, permissions: [Permissions.MeetingRead] },
  {
    id: 'announcements',
    prefix: ROUTES.announcements,
    permissions: [Permissions.CommunicationRead],
  },
  {
    id: 'recruitments',
    prefix: ROUTES.recruitments,
    permissions: [Permissions.RecruitmentRead, Permissions.RecruitmentObserve],
  },
  { id: 'academy', prefix: ROUTES.academy, permissions: [Permissions.AcademyRead] },
  { id: 'legacy', prefix: ROUTES.legacy, permissions: [Permissions.LegacyRead] },
  { id: 'calendar', prefix: ROUTES.calendar, permissions: [Permissions.CalendarRead] },
  { id: 'lives', prefix: ROUTES.lives, permissions: [Permissions.LiveRead] },
  { id: 'moderation', prefix: '/moderation', permissions: [Permissions.SanctionRead] },
]

// Prefix of one section's topic
const SECTION_PREFIX = 'section:'

/**
 * Topics of the section rooms
 * @type {{ section: (id: string) => string, sectionOf: (topic: string) => PresenceSection | null }}
 */

export const SECTION_TOPICS = {
  section: (id: string) => `${SECTION_PREFIX}${id}`,
  sectionOf: (topic: string): PresenceSection | null =>
    topic.startsWith(SECTION_PREFIX)
      ? (PRESENCE_SECTIONS.find((section) => section.id === topic.slice(SECTION_PREFIX.length)) ??
        null)
      : null,
}

/**
 * Section a route belongs to
 * @param {string} pathname - Route on screen
 * @return {PresenceSection | null} - Section, null when personal
 */

export const sectionOfPath = (pathname: string): PresenceSection | null =>
  PRESENCE_SECTIONS.find(
    (section) => pathname === section.prefix || pathname.startsWith(`${section.prefix}/`)
  ) ?? null
