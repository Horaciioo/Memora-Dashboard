import type { IconName } from '@/declarations/ui/icons'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Every addressable route
 * @type {Record<string, string | ((id: string) => string)>}
 */

export const ROUTES = {
  home: '/',
  login: '/connexion',
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
  academy: '/academy',
  session: (id: string) => `/academy/${id}`,
  junior: (sessionId: string, juniorId: string) => `/academy/${sessionId}/${juniorId}`,
  sanctions: '/moderation/sanctions',
  settings: '/configuration',
  settingsSection: (section: string) => `/configuration/${section}`,
  settingsRecord: (section: string, id: string) => `/configuration/${section}/${id}`,
} as const

/**
 * Navigation entry
 * @typedef {Object} NavigationItem
 * @property {string} href - Destination
 * @property {string} label - Display label
 * @property {IconName} icon - Icon key
 * @property {PermissionName} [permission] - Permission needed
 * @property {boolean} [wip] - Marked as under construction
 */

export interface NavigationItem {
  href: string
  label: string
  icon: IconName
  permission?: PermissionName
  wip?: boolean
}

/**
 * Navigation group
 * @typedef {Object} NavigationGroup
 * @property {string} label - Section label
 * @property {NavigationItem[]} items - Entries
 */

export interface NavigationGroup {
  label: string
  items: NavigationItem[]
}

/**
 * Sidebar navigation tree
 * @type {NavigationGroup[]}
 */

export const NAVIGATION: NavigationGroup[] = [
  {
    label: 'Personnel',
    items: [
      { href: ROUTES.dashboard, label: 'Mon tableau de bord', icon: 'dashboard', wip: true },
      { href: ROUTES.absences, label: 'Absences', icon: 'absences' },
    ],
  },
  {
    label: 'Pilotage',
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
    ],
  },
  {
    label: 'Modération',
    items: [
      {
        href: ROUTES.livecon,
        label: 'Livecon',
        icon: 'livecon',
        permission: Permissions.LiveconRead,
      },
      { href: ROUTES.sanctions, label: 'Panel de sanctions', icon: 'sanctions', wip: true },
    ],
  },
  {
    label: 'Administration',
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
  academy: 'Marsha Academy',
  moderation: 'Modération',
  sanctions: 'Panel de sanctions',
  configuration: 'Configuration',
  acces: 'Accès',
}
