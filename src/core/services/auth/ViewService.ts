import 'server-only'

import { readActiveCreator, readNavigationView } from '@/core/lib/auth/activeCreator'
import { isActualGlobal } from '@/core/lib/auth/simulation'
import { readLedCreators } from '@/core/services/auth/LeadService'
import { ROLE_REGISTRY, isEncadrement } from '@/declarations/access/roles'
import { VIEW_ROLES } from '@/declarations/access/views'
import { NAVIGATION_VIEW_ORDER, NavigationViews, viewDepth } from '@/declarations/navigation'
import type { NavigationViewName } from '@/declarations/navigation'
import { ADMIN_ROLES, MemberRoles } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { MENTION_PAGES } from '@/declarations/notifications/targets'
import type { CreatorLead, MentionBubble, ViewContext } from '@/types/access'
import type { NotificationEntry } from '@/types/notifications'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import { prisma } from '@/core/lib/db'
import { readScope } from '@/core/services/auth/ScopeService'
import { readBeacon } from '@/core/services/lives/LiveService'
import { unreadMentions } from '@/core/services/system/NotificationService'
import { readOverdueFlags } from '@/core/services/work/OverdueService'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Widest reachable view
 * @param {MemberRoleName} role - Hierarchy level
 * @param {boolean} isRoot - Root administrator
 * @return {NavigationViewName} - Widest view
 */

const ceilingFor = (role: MemberRoleName, isRoot: boolean): NavigationViewName => {
  if (isRoot) return NavigationViews.Administration

  const rank = ROLE_REGISTRY.get(role).rank

  // The widest view any level at or under this rank unlocks
  const reachable = ROLE_REGISTRY.keys
    .filter((candidate) => ROLE_REGISTRY.get(candidate).rank <= rank)
    .map((candidate) => ROLE_REGISTRY.get(candidate).view)
    .filter((view): view is NavigationViewName => view !== undefined)

  return reachable.reduce(
    (widest, view) => (viewDepth(view) > viewDepth(widest) ? view : widest),
    NAVIGATION_VIEW_ORDER[0]
  )
}

/**
 * Reachable views
 * @param {SessionUser} viewer - Signed-in member
 * @return {NavigationViewName[]} - Reachable views
 */

export const reachableViews = (viewer: SessionUser): NavigationViewName[] => {
  const ceiling = ceilingFor(viewer.actual.role, viewer.actual.isRoot)
  // The employee stands level with the Responsable
  const skipsLead = !viewer.actual.isRoot && viewer.actual.role === MemberRoles.Employe

  return NAVIGATION_VIEW_ORDER.filter(
    (view) => viewDepth(view) <= viewDepth(ceiling) && !(skipsLead && view === NavigationViews.Lead)
  )
}

/**
 * Role standing for each view, the own view wearing the real level
 * @param {SessionUser} viewer - Signed-in member
 * @param {NavigationViewName} own - View of the real level
 * @return {Record<NavigationViewName, MemberRoleName>} - Role per view
 */

const viewRolesFor = (
  viewer: SessionUser,
  own: NavigationViewName
): Record<NavigationViewName, MemberRoleName> => ({
  ...VIEW_ROLES,
  [own]: viewer.actual.isRoot ? MemberRoles.Admin : viewer.actual.role,
})

/**
 * Pickable creators
 * @param {SessionUser} viewer - Signed-in member
 * @return {Promise<CreatorLead[]>} - Pickable creators
 */

export const pickableCreators = async (viewer: SessionUser): Promise<CreatorLead[]> => {
  const select = { id: true, name: true, handle: true, accent: true, avatarUrl: true }

  // An administrator picks from every creator
  if (isActualGlobal(viewer.actual)) {
    const rows = await prisma.youtuber.findMany({
      where: { archived: false },
      orderBy: { position: 'asc' },
      select,
    })

    return rows.map((row) => ({ ...row, teamId: null, teamName: null }))
  }

  const led = await readLedCreators(viewer.id)
  const ledIds = new Set(led.map((creator) => creator.id))

  // Assigned creators sit in the perimeter too
  const assigned = await prisma.youtuber.findMany({
    where: {
      archived: false,
      id: { in: viewer.actual.youtuberIds.filter((id) => !ledIds.has(id)) },
    },
    orderBy: { position: 'asc' },
    select,
  })

  return [...led, ...assigned.map((row) => ({ ...row, teamId: null, teamName: null }))]
}

/**
 * Creator picker shows
 * @param {NavigationViewName} view - View on screen
 * @param {NavigationViewName} own - View of the real level
 * @return {boolean} - Picker belongs on the rail
 */

const picksCreator = (view: NavigationViewName, own: NavigationViewName): boolean =>
  view !== own || viewDepth(view) >= viewDepth(NavigationViews.Lead)

/**
 * Resolve the view
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<ViewContext>} - View
 */

export const readViewContext = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<ViewContext> => {
  const available = reachableViews(viewer)
  const stored = await readNavigationView()
  const own = ceilingFor(viewer.actual.role, viewer.actual.isRoot)

  // A view a member no longer reaches falls back to their own
  const view = stored && available.includes(stored) ? stored : own

  // Lives light the Livecon entry
  const readLive = async () =>
    access.can(Permissions.LiveRead)
      ? readBeacon(await readScope(viewer, access), viewer.id, access.can(Permissions.LiveAnnounce))
      : null

  const [creators, activeYoutuberId, live, overdue, mentions] = await Promise.all([
    picksCreator(view, own) ? pickableCreators(viewer) : Promise.resolve([]),
    readActiveCreator(),
    readLive(),
    readOverdueFlags(viewer.id, access),
    unreadMentions(viewer.id),
  ])

  const known = creators.some((creator) => creator.id === activeYoutuberId)

  return {
    view,
    available,
    roles: viewRolesFor(viewer, own),
    // Lightning is a responsable-and-above affordance
    switchable: available.length > 1 && (viewer.actual.isRoot || isEncadrement(viewer.actual.role)),
    creators,
    activeYoutuberId: known ? activeYoutuberId : null,
    live,
    overdue,
    mentions: mentionBubbles(mentions),
  }
}

/**
 * Pages lit by unseen mentions, once each
 * @param {NotificationEntry[]} mentions - Unopened mentions, newest first
 * @return {MentionBubble[]} - One bubble per page
 */

const mentionBubbles = (mentions: NotificationEntry[]): MentionBubble[] => {
  const bubbles = new Map<string, MentionBubble>()

  for (const mention of mentions) {
    const href = mention.target ? MENTION_PAGES[mention.target] : undefined
    if (!href) continue

    const known = bubbles.get(href)
    bubbles.set(href, {
      href,
      actorName: known?.actorName ?? mention.actorName,
      count: (known?.count ?? 0) + 1,
    })
  }

  return [...bubbles.values()]
}

/**
 * Check the admin level
 * @param {MemberRoleName} role - Hierarchy level
 * @return {boolean} - Sits at admin level
 */

export const isAdminRole = (role: MemberRoleName): boolean => ADMIN_ROLES.includes(role)
