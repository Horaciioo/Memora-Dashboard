import type { IconName } from '@/declarations/ui/icons'
import type { MemberRoleName, MemberStatusName } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Every addressable route
 * @type {Record<string, string | ((id: string) => string)>}
 */

export const ROUTES = {
  home: '/',
  login: '/connexion',
  admission: (token: string) => `/admission/${token}`,
  dashboard: '/tableau-de-bord',
  members: '/moderateurs',
  member: (id: string) => `/moderateurs/${id}`,
  teams: '/equipes',
  projects: '/projets',
  project: (id: string) => `/projets/${id}`,
  tasks: '/taches',
  meetings: '/reunions',
  absences: '/absences',
  livecon: '/livecon',
  calendar: '/calendrier',
  trainings: '/formations',
  academy: '/academy',
  glossary: '/academy/lexique',
  session: (id: string) => `/academy/${id}`,
  junior: (sessionId: string, juniorId: string) => `/academy/${sessionId}/${juniorId}`,
  sanctions: '/moderation/sanctions',
  preferences: '/parametres',
  settings: '/configuration',
  settingsSection: (section: string) => `/configuration/${section}`,
  settingsRecord: (section: string, id: string) => `/configuration/${section}/${id}`,
} as const

/**
 * Rule keeping an entry out of the rail
 * @typedef {Object} NavigationCondition
 * @property {MemberStatusName[]} [statuses] - Statuses the entry is meant for
 * @property {MemberRoleName[]} [roles] - Roles the entry is meant for
 */

export interface NavigationCondition {
  statuses?: MemberStatusName[]
  roles?: MemberRoleName[]
}

/**
 * Navigation entry
 * @typedef {Object} NavigationItem
 * @property {string} href - Destination
 * @property {string} label - Display label
 * @property {IconName} icon - Icon key
 * @property {PermissionName} [permission] - Permission needed
 * @property {NavigationCondition} [visibleWhen] - Display rule
 * @property {boolean} [wip] - Marked as under construction
 */

export interface NavigationItem {
  href: string
  label: string
  icon: IconName
  permission?: PermissionName
  visibleWhen?: NavigationCondition
  wip?: boolean
}

/**
 * Read a navigation rule against the signed-in member
 * @param {NavigationCondition | undefined} condition - Rule carried by the entry
 * @param {Object} member - Signed-in member
 * @param {MemberStatusName} member.status - Membership status
 * @param {MemberRoleName} member.role - Hierarchy level
 * @return {boolean} - Entry belongs on the rail
 */

export const matchesNavigation = (
  condition: NavigationCondition | undefined,
  member: { status: MemberStatusName; role: MemberRoleName }
): boolean => {
  if (!condition) return true
  if (condition.statuses && !condition.statuses.includes(member.status)) return false

  return !condition.roles || condition.roles.includes(member.role)
}

/**
 * The two faces of the rail, moderation work on one side, running the corp on the other
 * @type {Record<string, string>}
 */

export const NavigationViews = {
  Moderation: 'MODERATION',
  Administration: 'ADMINISTRATION',
} as const

/**
 * Rail view name
 * @type {(typeof NavigationViews)[keyof typeof NavigationViews]}
 */

export type NavigationViewName = (typeof NavigationViews)[keyof typeof NavigationViews]

/**
 * Navigation group
 * @typedef {Object} NavigationGroup
 * @property {string} label - Section label
 * @property {NavigationViewName[]} views - Views the group belongs to
 * @property {NavigationItem[]} items - Entries
 */

export interface NavigationGroup {
  label: string
  views: NavigationViewName[]
  items: NavigationItem[]
}

/**
 * Sidebar navigation tree
 * @type {NavigationGroup[]}
 */

export const NAVIGATION: NavigationGroup[] = [
  {
    label: 'Personnel',
    views: [NavigationViews.Moderation, NavigationViews.Administration],
    items: [
      { href: ROUTES.dashboard, label: 'Mon tableau de bord', icon: 'dashboard', wip: true },
      { href: ROUTES.absences, label: 'Absences', icon: 'absences' },
      {
        href: ROUTES.calendar,
        label: 'Calendrier',
        icon: 'meetings',
        permission: Permissions.CalendarRead,
      },
      {
        href: ROUTES.trainings,
        label: 'Formations',
        icon: 'academy',
        permission: Permissions.AcademyTrainingComplete,
        visibleWhen: { statuses: ['ACADEMY'] },
      },
    ],
  },
  {
    label: 'Pilotage',
    views: [NavigationViews.Administration],
    items: [
      {
        href: ROUTES.projects,
        label: 'Projets',
        icon: 'projects',
        permission: Permissions.ProjectRead,
      },
      { href: ROUTES.tasks, label: 'Tâches', icon: 'tasks', permission: Permissions.TaskRead },
      {
        href: ROUTES.meetings,
        label: 'Réunions',
        icon: 'meetings',
        permission: Permissions.MeetingRead,
      },
    ],
  },
  {
    label: 'Équipe',
    views: [NavigationViews.Administration],
    items: [
      {
        href: ROUTES.members,
        label: 'Modérateurs',
        icon: 'members',
        permission: Permissions.MemberRead,
      },
      { href: ROUTES.teams, label: 'Équipes', icon: 'teams', permission: Permissions.TeamRead },
      {
        href: ROUTES.academy,
        label: 'Marsha Academy',
        icon: 'academy',
        permission: Permissions.AcademyRead,
      },
      {
        href: ROUTES.glossary,
        label: 'Lexique',
        icon: 'glossary',
        permission: Permissions.AcademyRead,
      },
    ],
  },
  {
    label: 'Modération',
    views: [NavigationViews.Moderation],
    items: [
      {
        href: ROUTES.sanctions,
        label: 'Panel de sanctions',
        icon: 'sanctions',
        permission: Permissions.SanctionRead,
      },
    ],
  },
  {
    label: 'Administration',
    views: [NavigationViews.Administration],
    items: [
      {
        href: ROUTES.settings,
        label: 'Configuration',
        icon: 'settings',
        permission: Permissions.ReferenceRead,
      },
    ],
  },
]

/**
 * Breadcrumb crumb
 * @typedef {Object} Crumb
 * @property {string} label - Display label
 * @property {string} [href] - Destination when clickable
 */

export interface Crumb {
  label: string
  href?: string
}

/**
 * Labels of the first path segment
 * @type {Record<string, string>}
 */

export const SEGMENT_LABELS: Record<string, string> = {
  'tableau-de-bord': 'Mon tableau de bord',
  moderateurs: 'Modérateurs',
  equipes: 'Équipes',
  projets: 'Projets',
  taches: 'Tâches',
  reunions: 'Réunions',
  absences: 'Absences',
  livecon: 'Livecon',
  calendrier: 'Calendrier',
  formations: 'Formations',
  academy: 'Marsha Academy',
  lexique: 'Lexique',
  moderation: 'Modération',
  sanctions: 'Panel de sanctions',
  parametres: 'Paramètres',
  configuration: 'Configuration',
  acces: 'Accès',
}
