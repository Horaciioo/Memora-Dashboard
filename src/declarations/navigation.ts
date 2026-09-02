import type { MaturityName } from '@/declarations/maturity/registries'
import { SYSTEM_SCREENS } from '@/declarations/system/screens'
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
  privacy: '/confidentialite',
  integration: (token: string) => `/integration/${token}`,
  dashboard: '/tableau-de-bord',
  members: '/moderateurs',
  member: (id: string) => `/moderateurs/${id}`,
  projects: '/projets',
  project: (id: string) => `/projets/${id}`,
  tasks: '/taches',
  task: (id: string) => `/taches/${id}`,
  meetings: '/reunions',
  meeting: (id: string) => `/reunions/${id}`,
  absences: '/absences',
  livecon: '/livecon',
  calendar: '/calendrier',
  calendarEvent: (id: string) => `/calendrier?evenement=${id}`,
  calendarLegend: '/calendrier/legende',
  trainings: '/formations',
  academy: '/academy',
  glossary: '/academy/lexique',
  session: (id: string) => `/academy/${id}`,
  junior: (sessionId: string, juniorId: string) => `/academy/${sessionId}/${juniorId}`,
  recruitments: '/recrutements',
  recruitment: (id: string) => `/recrutements/${id}`,
  sanctions: '/moderation/sanctions',
  notifications: '/notifications',
  administration: '/administration',
  maturity: '/maturite',
  preferences: '/parametres',
  settings: '/configuration',
  teams: '/configuration/equipes',
  settingsSection: (section: string) => `/configuration/${section}`,
  settingsRecord: (section: string, id: string) => `/configuration/${section}/${id}`,
  system: '/systeme',
  storage: '/systeme/stockage',
  journal: '/systeme/journaux',
  queues: '/systeme/files',
  probes: '/systeme/sondes',
  analytics: '/systeme/ga4',
} as const

// The three faces of the rail
export const NavigationViews = {
  Moderation: 'MODERATION',
  Lead: 'LEAD',
  Administration: 'ADMINISTRATION',
} as const

/**
 * Rail view name
 * @type {(typeof NavigationViews)[keyof typeof NavigationViews]}
 */

export type NavigationViewName = (typeof NavigationViews)[keyof typeof NavigationViews]

/**
 * Views, narrowest first
 * @type {NavigationViewName[]}
 */

export const NAVIGATION_VIEW_ORDER: NavigationViewName[] = [
  NavigationViews.Moderation,
  NavigationViews.Lead,
  NavigationViews.Administration,
]

/**
 * Depth of a view
 * @param {NavigationViewName} view - Rail view
 * @return {number} - Depth
 */

export const viewDepth = (view: NavigationViewName): number => NAVIGATION_VIEW_ORDER.indexOf(view)

/**
 * Check a raw view
 * @param {string | undefined} candidate - Raw value
 * @return {boolean} - Known view
 */

export const isNavigationView = (candidate: string | undefined): candidate is NavigationViewName =>
  candidate !== undefined && NAVIGATION_VIEW_ORDER.includes(candidate as NavigationViewName)

/**
 * Walk the reachable views in order, wrapping back to the narrowest one
 * @param {NavigationViewName} view - View on screen
 * @param {NavigationViewName[]} available - Views the member may switch between
 * @return {NavigationViewName} - View the switch lands on
 */

export const nextNavigationView = (
  view: NavigationViewName,
  available: NavigationViewName[]
): NavigationViewName =>
  available.length === 0 ? view : available[(available.indexOf(view) + 1) % available.length]

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
 * Placement of an entry on the floating mobile nav pill
 * @typedef {Object} MobileNavSlot
 * @property {'home' | 'primary'} slot - Home sits centred, primary either side of it
 * @property {number} order - Rank among every primary entry, lowest shown first
 */

export interface MobileNavSlot {
  slot: 'home' | 'primary'
  order: number
}

/**
 * Navigation entry
 * @typedef {Object} NavigationItem
 * @property {string} href - Destination
 * @property {string} label - Display label
 * @property {IconName} icon - Icon key
 * @property {NavigationViewName} [from] - Narrowest view, defaults to the group's own
 * @property {PermissionName} [permission] - Permission needed
 * @property {NavigationCondition} [visibleWhen] - Display rule
 * @property {MaturityName} [maturity] - Lifecycle stage shown as a tag
 * @property {MobileNavSlot} [mobile] - Promotes the entry onto the mobile nav pill
 */

export interface NavigationItem {
  href: string
  label: string
  icon: IconName
  from?: NavigationViewName
  permission?: PermissionName
  visibleWhen?: NavigationCondition
  maturity?: MaturityName
  mobile?: MobileNavSlot
}

/**
 * Navigation group
 * @typedef {Object} NavigationGroup
 * @property {string} label - Section label
 * @property {NavigationViewName} from - Narrowest view the group appears in
 * @property {NavigationViewName[]} [hiddenIn] - Views the group is pulled from
 * @property {NavigationItem[]} items - Entries
 */

export interface NavigationGroup {
  label: string
  from: NavigationViewName
  hiddenIn?: NavigationViewName[]
  items: NavigationItem[]
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
 * Group belongs on the rail, an explicit hide winning over the floor
 * @param {NavigationGroup} group - Navigation group
 * @param {NavigationViewName} view - Rail view on screen
 * @return {boolean} - Group belongs on the rail
 */

export const groupInView = (group: NavigationGroup, view: NavigationViewName): boolean =>
  viewDepth(view) >= viewDepth(group.from) && !group.hiddenIn?.includes(view)

/**
 * Entry belongs on the rail, its own floor winning over the group's
 * @param {NavigationItem} item - Navigation entry
 * @param {NavigationGroup} group - Group holding it
 * @param {NavigationViewName} view - Rail view on screen
 * @return {boolean} - Entry belongs on the rail
 */

export const itemInView = (
  item: NavigationItem,
  group: NavigationGroup,
  view: NavigationViewName
): boolean => viewDepth(view) >= viewDepth(item.from ?? group.from)

/**
 * Sidebar navigation tree
 * @type {NavigationGroup[]}
 */

export const NAVIGATION: NavigationGroup[] = [
  {
    label: 'Personnel',
    from: NavigationViews.Moderation,
    items: [
      {
        href: ROUTES.dashboard,
        label: 'Accueil',
        icon: 'dashboard',
        maturity: 'dev',
        mobile: { slot: 'home', order: 0 },
      },
      { href: ROUTES.absences, label: 'Absences', icon: 'absences' },
      {
        href: ROUTES.calendar,
        label: 'Calendrier',
        icon: 'meetings',
        permission: Permissions.CalendarRead,
        maturity: 'beta',
        mobile: { slot: 'primary', order: 7 },
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
    from: NavigationViews.Lead,
    items: [
      {
        href: ROUTES.members,
        label: 'Modérateurs',
        icon: 'members',
        permission: Permissions.MemberRead,
        mobile: { slot: 'primary', order: 6 },
      },
      {
        href: ROUTES.projects,
        label: 'Projets',
        icon: 'projects',
        permission: Permissions.ProjectRead,
        mobile: { slot: 'primary', order: 3 },
      },
      {
        href: ROUTES.tasks,
        label: 'Tâches',
        icon: 'tasks',
        permission: Permissions.TaskRead,
        mobile: { slot: 'primary', order: 4 },
      },
      {
        href: ROUTES.meetings,
        label: 'Réunions',
        icon: 'meetings',
        permission: Permissions.MeetingRead,
        mobile: { slot: 'primary', order: 5 },
      },
    ],
  },
  {
    label: 'Vivier',
    from: NavigationViews.Lead,
    items: [
      {
        href: ROUTES.recruitments,
        label: 'Recrutements',
        icon: 'recruitment',
        permission: Permissions.RecruitmentRead,
        maturity: 'beta',
      },
      {
        href: ROUTES.academy,
        label: 'Marsha Academy',
        icon: 'academy',
        permission: Permissions.AcademyRead,
        maturity: 'alpha',
      },
    ],
  },
  {
    label: 'Modération',
    from: NavigationViews.Moderation,
    // Off the responsable view, kept for the modération and admin ones
    hiddenIn: [NavigationViews.Lead],
    items: [
      {
        href: ROUTES.sanctions,
        label: 'Panel de sanctions',
        icon: 'sanctions',
        permission: Permissions.SanctionRead,
        mobile: { slot: 'primary', order: 8 },
      },
    ],
  },
  {
    label: 'Système',
    from: NavigationViews.Lead,
    items: [
      {
        href: ROUTES.settings,
        label: 'Configuration',
        icon: 'settings',
        permission: Permissions.ReferenceRead,
        maturity: 'dev',
        mobile: { slot: 'primary', order: 2 },
      },
      {
        href: ROUTES.administration,
        label: 'Console admin',
        icon: 'console',
        from: NavigationViews.Administration,
        permission: Permissions.AccessManage,
        mobile: { slot: 'primary', order: 1 },
      },
      ...SYSTEM_SCREENS.map((screen) => ({
        href: ROUTES[screen.route],
        label: screen.label,
        icon: screen.icon,
        from: NavigationViews.Administration,
        permission: Permissions.AccessManage,
        maturity: screen.maturity,
      })),
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
  'tableau-de-bord': 'Accueil',
  moderateurs: 'Modérateurs',
  equipes: 'Équipes',
  projets: 'Projets',
  taches: 'Tâches',
  reunions: 'Réunions',
  absences: 'Absences',
  livecon: 'Livecon',
  calendrier: 'Calendrier',
  legende: 'Légende',
  formations: 'Formations',
  academy: 'Marsha Academy',
  recrutements: 'Recrutements',
  lexique: 'Lexique',
  moderation: 'Modération',
  sanctions: 'Panel de sanctions',
  notifications: 'Notifications',
  administration: 'Console admin',
  maturite: 'Maturité',
  parametres: 'Paramètres',
  configuration: 'Configuration',
  acces: 'Accès',
  systeme: 'Système',
  stockage: 'Stockage',
  journaux: 'Journaux',
  files: 'Files de jobs',
  sondes: 'Sondes',
  ga4: 'GA4',
}

/**
 * Nav groups reachable in a view
 * @param {NavigationViewName} view - Rail view on screen
 * @param {Object} member - Signed-in member
 * @param {MemberStatusName} member.status - Membership status
 * @param {MemberRoleName} member.role - Hierarchy level
 * @param {(permission: PermissionName) => boolean} can - Permission check
 * @return {NavigationGroup[]} - Groups holding only their visible items
 */

export const visibleNavGroups = (
  view: NavigationViewName,
  member: { status: MemberStatusName; role: MemberRoleName } | null,
  can: (permission: PermissionName) => boolean
): NavigationGroup[] =>
  NAVIGATION.filter((group) => groupInView(group, view))
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          itemInView(item, group, view) &&
          (!item.permission || can(item.permission)) &&
          (!member || matchesNavigation(item.visibleWhen, member))
      ),
    }))
    .filter((group) => group.items.length > 0)

/**
 * Bar contents of the floating mobile nav
 * @typedef {Object} MobileNavigation
 * @property {NavigationItem | null} home - Centre destination
 * @property {NavigationItem[]} primary - Destinations shown either side of home
 */

export interface MobileNavigation {
  home: NavigationItem | null
  primary: NavigationItem[]
}

/**
 * Pick Accueil and its ranked neighbours for the nav pill — anything left out is still
 * reachable through the more sheet, which reads the full visibleNavGroups on its own
 * @param {NavigationViewName} view - Rail view on screen
 * @param {Object} member - Signed-in member
 * @param {MemberStatusName} member.status - Membership status
 * @param {MemberRoleName} member.role - Hierarchy level
 * @param {(permission: PermissionName) => boolean} can - Permission check
 * @param {number} maxPrimary - Primary slots kept before overflowing
 * @return {MobileNavigation} - Bar contents
 */

export const mobileNavigation = (
  view: NavigationViewName,
  member: { status: MemberStatusName; role: MemberRoleName } | null,
  can: (permission: PermissionName) => boolean,
  maxPrimary: number
): MobileNavigation => {
  const items = visibleNavGroups(view, member, can)
    .flatMap((group) => group.items)
    .filter((item): item is NavigationItem & { mobile: MobileNavSlot } => item.mobile !== undefined)

  const home = items.find((item) => item.mobile.slot === 'home') ?? null
  const primary = items
    .filter((item) => item.mobile.slot === 'primary')
    .sort((a, b) => a.mobile.order - b.mobile.order)
    .slice(0, maxPrimary)

  return { home, primary }
}
