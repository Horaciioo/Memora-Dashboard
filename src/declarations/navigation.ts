import type { MaturityName } from '@/declarations/maturity/registries'
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
  exercise: (token: string) => `/exercice/${token}`,
  dashboard: '/tableau-de-bord',
  members: '/moderateurs',
  member: (id: string) => `/moderateurs/${id}`,
  projects: '/projets',
  project: (id: string) => `/projets/${id}`,
  tasks: '/taches',
  task: (id: string) => `/taches/${id}`,
  meetings: '/reunions',
  announcements: '/communications',
  meeting: (id: string) => `/reunions/${id}`,
  absences: '/absences',
  lives: '/lives',
  live: (id: string) => `/lives/${id}`,
  liveReport: (id: string) => `/lives/${id}/bilan`,
  liveCreatorReport: (id: string) => `/lives/${id}/bilan-createur`,
  calendar: '/calendrier',
  calendarEvent: (id: string) => `/calendrier?evenement=${id}`,
  // Calendar opened on the form of a template
  calendarNew: (preset: string) => `/calendrier?modele=${preset}`,
  // Grid opened on a day, optionally on one calendar only
  calendarDay: (day: string, layer?: string) =>
    `/calendrier?jour=${day}${layer ? `&calque=${layer}` : ''}`,
  trainings: '/formations',
  training: (id: string) => `/formations/${id}`,
  academy: '/academy',
  session: (id: string) => `/academy/${id}`,
  legacy: '/legacy',
  legacyTrack: (id: string) => `/legacy/${id}`,
  junior: (sessionId: string, juniorId: string) => `/academy/${sessionId}/${juniorId}`,
  recruitments: '/recrutements',
  recruitment: (id: string) => `/recrutements/${id}`,
  candidate: (sessionId: string, candidateId: string) =>
    `/recrutements/${sessionId}/${candidateId}`,
  interview: (sessionId: string, candidateId: string) =>
    `/recrutements/${sessionId}/${candidateId}/entretien`,
  sanctions: '/moderation/sanctions',
  discordSanctions: '/moderation/discord',
  marsha: '/moderation/marsha',
  notifications: '/notifications',
  administration: '/administration',
  maturity: '/maturite',
  changelog: '/nouveautes',
  play: '/play',
  playSession: (id: string) => `/play/parties/${id}`,
  preferences: '/parametres',
  settings: '/configuration',
  teams: '/configuration/youtubeurs',
  settingsSection: (section: string) => `/configuration/${section}`,
  settingsRecord: (section: string, id: string) => `/configuration/${section}/${id}`,
  system: '/systeme',
  storage: '/systeme/stockage',
  journal: '/systeme/logs',
  queues: '/systeme/files',
  probes: '/systeme/sondes',
  analytics: '/systeme/activite',
  health: '/systeme/sante',
  privileged: '/systeme/employes',
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

export const TRAININGS_DONE_PARAM = 'achevee'

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
        label: 'Accueil',
        icon: 'dashboard',
        maturity: 'alpha',
        quick: true,
      },
      { href: ROUTES.absences, label: 'Absences', icon: 'absences', maturity: 'new' },
      { href: ROUTES.changelog, label: 'Nouveautés', icon: 'news', quick: true },
      {
        href: ROUTES.play,
        label: 'Play',
        icon: 'play',
        permission: Permissions.PlayAccess,
        maturity: 'alpha',
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
      // The Observateurs read the sessions from the moderator view, Programmes holds them above
      {
        href: ROUTES.recruitments,
        label: 'Recrutements',
        icon: 'recruitment',
        hiddenIn: [NavigationViews.Lead, NavigationViews.Administration],
        permission: Permissions.RecruitmentObserve,
        maturity: 'beta',
      },
      // The Formateurs open the Academy from the moderator view, Programmes holds it above
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
        label: 'Live en cours',
        icon: 'liveDot',
        permission: Permissions.LiveRead,
        maturity: 'alpha',
        onLive: true,
      },
      {
        href: ROUTES.sanctions,
        label: 'Panel de sanctions',
        icon: 'liveconCrisis',
        permission: Permissions.SanctionRead,
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
        permission: Permissions.SanctionRead,
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
  'tableau-de-bord': 'Accueil',
  moderateurs: 'Modérateurs',
  equipes: 'Équipes',
  projets: 'Projets',
  taches: 'Tâches',
  reunions: 'Réunions',
  communications: 'Communications',
  absences: 'Absences',
  lives: 'Live en cours',
  calendrier: 'Calendrier',
  formations: 'Formations',
  academy: 'Marsha Academy',
  legacy: 'Legacy',
  recrutements: 'Recrutements',
  moderation: 'Modération',
  sanctions: 'Panel de sanctions',
  discord: 'Panel Discord',
  marsha: 'Marsha Bots',
  notifications: 'Notifications',
  administration: 'Console admin',
  maturite: 'Maturité',
  nouveautes: 'Nouveautés',
  parametres: 'Paramètres',
  configuration: 'Configuration',
  acces: 'Accès',
  systeme: 'Système',
  stockage: 'Stockage',
  logs: 'Logs',
  files: 'Files de jobs',
  sondes: 'Sondes',
  activite: 'Activité',
  sante: 'Santé',
  employes: 'Employés',
  apercu: 'Aperçu',
  bilan: 'Bilan',
  'bilan-createur': 'Bilan',
}

/**
 * Stand-in for a record until its name loads
 * @type {Record<string, string>}
 */

export const RECORD_LABELS: Record<string, string> = {
  moderateurs: 'Fiche',
  projets: 'Projet',
  taches: 'Tâche',
  reunions: 'Réunion',
  academy: 'Session',
  formations: 'Cours',
  legacy: 'Parcours',
  recrutements: 'Session',
  youtubeurs: 'YouTubeur',
  lives: 'Live',
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

  return match?.maturity ?? null
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
 * @return {NavigationGroup[]} - Groups holding only their visible items
 */

export const visibleNavGroups = (
  view: NavigationViewName,
  member: { status: MemberStatusName; role: MemberRoleName } | null,
  can: (permission: PermissionName) => boolean
): NavigationGroup[] => {
  // A page reachable through two entries shows once, under the first
  const seen = new Set<string>()

  return NAVIGATION.filter((group) => groupInView(group, view))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const isVisible =
          itemInView(item, group, view) &&
          (!item.permission || can(item.permission)) &&
          (!member || matchesNavigation(item.visibleWhen, member))
        if (!isVisible || seen.has(item.href)) return false

        seen.add(item.href)

        return true
      }),
    }))
    .filter((group) => group.items.length > 0)
}
