import type { MaturityName } from '@/declarations/maturity/registries'
import { MANAGEMENT_BASE, MANAGEMENT_PAGES, managementHref } from '@/declarations/management/pages'
import { BLOCK_HASH_PREFIX } from '@/declarations/pages/editor'
import { PUSH_CONSOLE_COPY } from '@/declarations/pwa/copy'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import type { IconName } from '@/declarations/ui/icons'
import type { MemberRoleName, MemberStatusName } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

// Opens the picker on a fresh table
export const PLAY_INVITE_QUERY = 'invite'

/**
 * Every addressable route
 * @type {Record<string, string | ((id: string) => string)>}
 */

export const ROUTES = {
  home: '/',
  login: '/login',
  privacy: '/privacy',
  offline: '/offline',
  integration: (token: string) => `/integration/${token}`,
  welcome: '/welcome',
  welcomeLink: (token: string) => `/welcome/${token}`,
  exercise: (token: string) => `/exercise/${token}`,
  dashboard: '/dashboard',
  members: '/members',
  management: MANAGEMENT_BASE,
  member: (id: string) => `/members/${id}`,
  projects: '/projects',
  project: (id: string) => `/projects/${id}`,
  tasks: '/tasks',
  task: (id: string) => `/tasks/${id}`,
  meetings: '/meetings',
  announcements: '/communications',
  meeting: (id: string) => `/meetings/${id}`,
  absences: '/absences',
  lives: '/lives',
  modView: '/mod-view',
  live: (id: string) => `/lives/${id}`,
  liveReport: (id: string) => `/lives/${id}/report`,
  liveCreatorReport: (id: string) => `/lives/${id}/creator-report`,
  calendar: '/calendar',
  calendarEvent: (id: string) => `/calendar?event=${id}`,
  // Calendar opened on the form of a template
  calendarNew: (preset: string) => `/calendar?template=${preset}`,
  // Grid opened on a day, optionally on one calendar only
  calendarDay: (day: string, layer?: string) =>
    `/calendar?day=${day}${layer ? `&layer=${layer}` : ''}`,
  trainings: '/trainings',
  training: (id: string) => `/trainings/${id}`,
  academy: '/academy',
  session: (id: string) => `/academy/${id}`,
  legacy: '/legacy',
  legacyTrack: (id: string) => `/legacy/${id}`,
  junior: (sessionId: string, juniorId: string) => `/academy/${sessionId}/${juniorId}`,
  recruitments: '/recruitments',
  recruitment: (id: string) => `/recruitments/${id}`,
  candidate: (sessionId: string, candidateId: string) =>
    `/recruitments/${sessionId}/${candidateId}`,
  candidateBilan: (sessionId: string, candidateId: string) =>
    `/recruitments/${sessionId}/${candidateId}?tab=report`,
  interview: (sessionId: string, candidateId: string) =>
    `/recruitments/${sessionId}/${candidateId}/interview`,
  sanctions: '/moderation/sanctions',
  discordSanctions: '/moderation/discord',
  marsha: '/moderation/marsha',
  notifications: '/notifications',
  administration: '/administration',
  maturity: '/maturity',
  changelog: '/changelog',
  status: '/status',
  play: '/play',
  playGame: (slug: string) => `/play/${slug}`,
  playGroup: '/play/group',
  playGroupRoom: (groupId: string) => `/play/group/${groupId}`,
  playFeed: '/play/feed',
  playLounge: '/play/lounge',
  playStats: '/play/stats',
  playStatsGame: (slug: string) => `/play/stats?game=${slug}`,
  playHistory: (game?: string, cursor?: string) => {
    const query = new URLSearchParams()
    if (game) query.set('game', game)
    if (cursor) query.set('cursor', cursor)
    const text = query.toString()

    return text ? `/play/history?${text}` : '/play/history'
  },
  playTrophies: '/play/trophies',
  playRanking: (slug?: string) => (slug ? `/play/ranking?game=${slug}` : '/play/ranking'),
  playPlayer: (id: string) => `/play/players/${id}`,
  playPlayerGame: (id: string, slug: string) => `/play/players/${id}/${slug}`,
  playSession: (id: string) => `/play/sessions/${id}`,
  playSessionInvite: (id: string) => `/play/sessions/${id}?${PLAY_INVITE_QUERY}=1`,
  playJoinCode: (code: string) => `/play/join/${code}`,
  preferences: '/preferences',
  preferencesPlay: '/preferences?tab=play',
  settings: '/settings',
  teams: '/settings/creators',
  settingsSection: (section: string) => `/settings/${section}`,
  settingsRecord: (section: string, id: string) => `/settings/${section}/${id}`,
  system: '/system',
  storage: '/system/storage',
  journal: '/system/logs',
  queues: '/system/queues',
  push: '/system/push',
  probes: '/system/probes',
  analytics: '/system/activity',
  health: '/system/health',
  privileged: '/system/employees',
  systemPages: '/system/pages',
  features: '/system/features',
  pages: '/pages',
  page: (id: string) => `/pages/${id}`,
  pageBlock: (id: string, blockId: string) => `/pages/${id}${BLOCK_HASH_PREFIX}${blockId}`,
  pagesTrash: '/pages/trash',
} as const

// The four faces of the rail
export const NavigationViews = {
  Junior: 'JUNIOR',
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
 * Views
 * @type {NavigationViewName[]}
 */

export const NAVIGATION_VIEW_ORDER: NavigationViewName[] = [
  NavigationViews.Junior,
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
 * Walk the reachable views in order
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
 * Rule showing an entry
 * @typedef {Object} NavigationCondition
 * @property {MemberStatusName[]} [statuses] - Statuses the entry is meant for
 * @property {MemberRoleName[]} [roles] - Roles the entry is meant for
 */

export interface NavigationCondition {
  statuses?: MemberStatusName[]
  roles?: MemberRoleName[]
}

/**
 * Query flag naming the course just finished
 * @type {string}
 */

export const TRAININGS_DONE_PARAM = 'completed'

/**
 * Page unfolded under an entry
 * @typedef {Object} NavigationChild
 * @property {string} href - Destination
 * @property {string} label - Display label
 * @property {PermissionName} permission - Permission needed
 */

export interface NavigationChild {
  href: string
  label: string
  permission: PermissionName
}

/**
 * Navigation entry
 * @typedef {Object} NavigationItem
 * @property {string} href - Destination
 * @property {string} label - Display label
 * @property {IconName} icon - Icon key
 * @property {NavigationViewName} [from] - Narrowest view
 * @property {NavigationViewName[]} [hiddenIn] - Views the entry is pulled from
 * @property {PermissionName} [permission] - Permission needed
 * @property {NavigationCondition} [visibleWhen] - Display rule
 * @property {MaturityName} [maturity] - Lifecycle stage shown as a tag
 * @property {boolean} [onLive] - Lights up while a live is open
 * @property {boolean} [quick] - Glyph box under the search
 * @property {NavigationChild[]} [children] - Pages unfolded beneath, the entry needs one of them
 */

export interface NavigationItem {
  href: string
  label: string
  icon: IconName
  from?: NavigationViewName
  hiddenIn?: NavigationViewName[]
  permission?: PermissionName
  visibleWhen?: NavigationCondition
  maturity?: MaturityName
  onLive?: boolean
  quick?: boolean
  children?: NavigationChild[]
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

  // Either list opens the entry
  return (
    (condition.statuses?.includes(member.status) ?? false) ||
    (condition.roles?.includes(member.role) ?? false)
  )
}

/**
 * Group belongs on the rail
 * @param {NavigationGroup} group - Navigation group
 * @param {NavigationViewName} view - Rail view on screen
 * @return {boolean} - Group belongs on the rail
 */

export const groupInView = (group: NavigationGroup, view: NavigationViewName): boolean =>
  viewDepth(view) >= viewDepth(group.from) && !group.hiddenIn?.includes(view)

/**
 * Entry belongs on the rail
 * @param {NavigationItem} item - Navigation entry
 * @param {NavigationGroup} group - Group holding it
 * @param {NavigationViewName} view - Rail view on screen
 * @return {boolean} - Entry belongs on the rail
 */

export const itemInView = (
  item: NavigationItem,
  group: NavigationGroup,
  view: NavigationViewName
): boolean =>
  viewDepth(view) >= viewDepth(item.from ?? group.from) && !item.hiddenIn?.includes(view)

/**
 * Sidebar navigation tree
 * @type {NavigationGroup[]}
 */

export const NAVIGATION: NavigationGroup[] = [
  {
    label: 'Personnel',
    from: NavigationViews.Junior,
    items: [
      {
        href: ROUTES.dashboard,
        label: NAV_COPY.home,
        icon: 'dashboard',
        maturity: 'alpha',
        quick: true,
      },
      { href: ROUTES.absences, label: 'Absences', icon: 'absences', maturity: 'new' },
      { href: ROUTES.changelog, label: 'Nouveautés', icon: 'news', quick: true },
      { href: ROUTES.pages, label: NAV_COPY.railPrivate, icon: 'page', maturity: 'alpha' },
      {
        href: ROUTES.play,
        label: 'Play',
        icon: 'play',
        permission: Permissions.PlayAccess,
        maturity: 'alpha',
        quick: true,
      },
      {
        href: ROUTES.calendar,
        label: 'Calendrier',
        icon: 'meetings',
        permission: Permissions.CalendarRead,
        maturity: 'beta',
      },
      {
        href: ROUTES.trainings,
        label: 'Formations',
        icon: 'academy',
        permission: Permissions.AcademyTrainingComplete,
        // Juniors train
        visibleWhen: { statuses: ['ACADEMY'], roles: ['ADMIN', 'EMPLOYE', 'RESPONSABLE'] },
        maturity: 'alpha',
      },
    ],
  },
  {
    label: 'Pilotage',
    from: NavigationViews.Junior,
    items: [
      {
        href: ROUTES.members,
        label: 'Modérateurs',
        icon: 'members',
        from: NavigationViews.Lead,
        permission: Permissions.MemberRead,
      },
      {
        href: ROUTES.projects,
        label: 'Projets',
        icon: 'projects',
        permission: Permissions.ProjectRead,
      },
      {
        href: ROUTES.tasks,
        label: 'Tâches',
        icon: 'tasks',
        permission: Permissions.TaskRead,
      },
      {
        href: ROUTES.meetings,
        label: 'Réunions',
        icon: 'meetings',
        permission: Permissions.MeetingRead,
      },
      {
        href: ROUTES.announcements,
        label: 'Communications',
        icon: 'communications',
        permission: Permissions.CommunicationRead,
        maturity: 'new',
      },
      {
        href: ROUTES.management,
        label: NAV_COPY.management,
        icon: 'settingsLine',
        from: NavigationViews.Lead,
        maturity: 'new',
        children: MANAGEMENT_PAGES.map((page) => ({
          href: managementHref(page.key),
          label: page.label,
          permission: page.permission,
        })),
      },
      // The Observateurs read the sessions from the moderator view, Programmes holds them above
      {
        href: ROUTES.recruitments,
        label: 'Recrutements',
        icon: 'recruitment',
        hiddenIn: [NavigationViews.Lead, NavigationViews.Administration],
        permission: Permissions.RecruitmentObserve,
        maturity: 'beta',
      },
      // The Référents open the Academy from the moderator view, Programmes holds it above
      {
        href: ROUTES.academy,
        label: 'Academy',
        icon: 'academy',
        hiddenIn: [NavigationViews.Lead, NavigationViews.Administration],
        permission: Permissions.AcademyRead,
        maturity: 'beta',
      },
    ],
  },
  {
    label: 'Programmes',
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
        label: 'Academy',
        icon: 'academy',
        permission: Permissions.AcademyRead,
        maturity: 'beta',
      },
      {
        href: ROUTES.legacy,
        label: 'Legacy',
        icon: 'flame',
        permission: Permissions.LegacyRead,
        maturity: 'alpha',
      },
    ],
  },
  {
    label: 'Twitch',
    from: NavigationViews.Junior,
    items: [
      {
        href: ROUTES.lives,
        label: 'Lives',
        icon: 'liveDot',
        permission: Permissions.LiveRead,
        maturity: 'alpha',
        onLive: true,
      },
      {
        href: ROUTES.sanctions,
        label: 'Panel Twitch',
        icon: 'liveconCrisis',
        permission: Permissions.SanctionRead,
        maturity: 'new',
      },
    ],
  },
  {
    label: 'Discord',
    from: NavigationViews.Junior,
    items: [
      {
        href: ROUTES.discordSanctions,
        label: 'Panel Discord',
        icon: 'liveconCrisis',
        permission: Permissions.SanctionDiscordRead,
        maturity: 'new',
      },
      { href: ROUTES.marsha, label: 'Marsha Bots', icon: 'discord' },
    ],
  },
  {
    label: 'Administration',
    from: NavigationViews.Lead,
    items: [
      {
        href: ROUTES.settings,
        label: 'Configuration',
        icon: 'settings',
        permission: Permissions.ReferenceRead,
        maturity: 'alpha',
      },
      {
        href: ROUTES.system,
        label: 'Système',
        icon: 'system',
        from: NavigationViews.Administration,
        permission: Permissions.AccessManage,
        // The employee never sees the system
        visibleWhen: { roles: ['ADMIN'] },
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
  dashboard: NAV_COPY.home,
  members: 'Modérateurs',
  management: NAV_COPY.management,
  networks: 'Réseaux',
  notes: 'Notes',
  birthdays: 'Anniversaires',
  arrivals: 'Arrivées',
  functions: 'Fonctions',
  teams: 'Équipes',
  projects: 'Projets',
  tasks: 'Tâches',
  meetings: 'Réunions',
  communications: 'Communications',
  absences: 'Absences',
  lives: 'Lives',
  'mod-view': 'Mod. View',
  calendar: 'Calendrier',
  trainings: 'Formations',
  academy: 'Marsha Academy',
  legacy: 'Legacy',
  recruitments: 'Recrutements',
  moderation: 'Modération',
  sanctions: 'Panel Twitch',
  discord: 'Panel Discord',
  marsha: 'Marsha Bots',
  notifications: 'Notifications',
  administration: 'Console admin',
  maturity: 'Maturité',
  changelog: 'Nouveautés',
  status: 'Memora Status',
  preferences: 'Paramètres',
  settings: 'Configuration',
  access: 'Accès',
  system: 'Système',
  storage: 'Stockage',
  logs: 'Logs',
  queues: 'Files de jobs',
  probes: 'Sondes',
  push: PUSH_CONSOLE_COPY.title,
  activity: 'Activité',
  health: 'Santé',
  employees: 'Employés',
  features: 'Fonctionnalités',
  pages: 'Pages privées',
  trash: 'Corbeille',
  preview: 'Aperçu',
  report: 'Bilan',
  'creator-report': 'Bilan',
}

/**
 * Stand-in for a record until its name loads
 * @type {Record<string, string>}
 */

export const RECORD_LABELS: Record<string, string> = {
  members: 'Fiche',
  projects: 'Projet',
  tasks: 'Tâche',
  meetings: 'Réunion',
  academy: 'Session',
  trainings: 'Cours',
  legacy: 'Parcours',
  recruitments: 'Session',
  creators: 'YouTubeur',
  lives: 'Live',
  pages: 'Page',
}

/**
 * Stage of pages the sidebar does not list
 * @type {Record<string, MaturityName>}
 */

const OFF_NAVIGATION_MATURITY: Record<string, MaturityName> = {
  [ROUTES.pages]: 'alpha',
}

/**
 * Lifecycle stage declared for the page a path belongs to
 * @param {string} pathname - Current path
 * @return {MaturityName | null} - Stage of the closest declared entry
 */

export const maturityOfPath = (pathname: string): MaturityName | null => {
  const match = NAVIGATION.flatMap((group) => group.items)
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((left, right) => right.href.length - left.href.length)[0]

  if (match) return match.maturity ?? null

  const own = Object.keys(OFF_NAVIGATION_MATURITY).find(
    (href) => pathname === href || pathname.startsWith(`${href}/`)
  )

  return own ? OFF_NAVIGATION_MATURITY[own] : null
}

/**
 * Category a path belongs to
 * @param {string} pathname - Current path
 * @return {string | null} - Label of the group holding the closest entry
 */

export const groupLabelOfPath = (pathname: string): string | null => {
  const matches = NAVIGATION.flatMap((group) =>
    group.items.map((item) => ({ href: item.href, label: group.label }))
  ).filter((entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`))

  return matches.sort((left, right) => right.href.length - left.href.length)[0]?.label ?? null
}

/**
 * Nav groups reachable in a view
 * @param {NavigationViewName} view - Rail view on screen
 * @param {Object} member - Signed-in member
 * @param {MemberStatusName} member.status - Membership status
 * @param {MemberRoleName} member.role - Hierarchy level
 * @param {(permission: PermissionName) => boolean} can - Permission check
 * @param {(path: string) => boolean} [isPathOpen] - Screen is not switched off
 * @return {NavigationGroup[]} - Groups holding only their visible items
 */

export const visibleNavGroups = (
  view: NavigationViewName,
  member: { status: MemberStatusName; role: MemberRoleName } | null,
  can: (permission: PermissionName) => boolean,
  isPathOpen?: (path: string) => boolean
): NavigationGroup[] => {
  // A page reachable through two entries shows once, under the first
  const seen = new Set<string>()

  return NAVIGATION.filter((group) => groupInView(group, view))
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => {
          const isVisible =
            itemInView(item, group, view) &&
            (!item.permission || can(item.permission)) &&
            (!item.children || item.children.some((child) => can(child.permission))) &&
            (!member || matchesNavigation(item.visibleWhen, member)) &&
            (!isPathOpen || isPathOpen(item.href))
          if (!isVisible || seen.has(item.href)) return false

          seen.add(item.href)

          return true
        })
        .map((item) =>
          item.children
            ? { ...item, children: item.children.filter((child) => can(child.permission)) }
            : item
        ),
    }))
    .filter((group) => group.items.length > 0)
}
