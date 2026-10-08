import 'server-only'

import { readActiveCreator, readNavigationView } from '@/core/lib/auth/activeCreator'
import { readLedCreators } from '@/core/services/auth/LeadService'
import { ROLE_REGISTRY, isEncadrement } from '@/declarations/access/roles'
import { NAVIGATION_VIEW_ORDER, NavigationViews, viewDepth } from '@/declarations/navigation'
import type { NavigationViewName } from '@/declarations/navigation'
import { MemberRoles } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import type { CreatorLead, ViewContext } from '@/types/access'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import { prisma } from '@/core/lib/db'
import { readScope } from '@/core/services/auth/ScopeService'
import { readBeacon } from '@/core/services/lives/LiveService'
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
    NavigationViews.Moderation
  )
}

/**
 * Reachable views
 * @param {SessionUser} viewer - Signed-in member
 * @return {NavigationViewName[]} - Reachable views
 */

export const reachableViews = (viewer: SessionUser): NavigationViewName[] => {
  const ceiling = ceilingFor(viewer.role, viewer.isRoot)

  return NAVIGATION_VIEW_ORDER.filter((view) => viewDepth(view) <= viewDepth(ceiling))
}

/**
 * Pickable creators
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<CreatorLead[]>} - Pickable creators
 */

export const pickableCreators = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<CreatorLead[]> => {
  const select = { id: true, name: true, handle: true, accent: true, avatarUrl: true }

  // An administrator picks from every creator
  if (access.isAdmin) {
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
    where: { archived: false, id: { in: viewer.youtuberIds.filter((id) => !ledIds.has(id)) } },
    orderBy: { position: 'asc' },
    select,
  })

  return [...led, ...assigned.map((row) => ({ ...row, teamId: null, teamName: null }))]
}

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

  // A view a member no longer reaches falls back to the base one
  const view = available.includes(stored) ? stored : NavigationViews.Moderation

  // Lives light the Livecon entry
  const readLive = async () =>
    access.can(Permissions.LiveRead)
      ? readBeacon(await readScope(viewer, access), viewer.id, access.can(Permissions.LiveAnnounce))
      : null

  const [creators, activeYoutuberId, live] = await Promise.all([
    view === NavigationViews.Moderation ? Promise.resolve([]) : pickableCreators(viewer, access),
    readActiveCreator(),
    readLive(),
  ])

  const known = creators.some((creator) => creator.id === activeYoutuberId)

  return {
    view,
    available,
    // Lightning is a responsable-and-above affordance
    switchable: available.length > 1 && (viewer.isRoot || isEncadrement(viewer.role)),
    creators,
    activeYoutuberId: known ? activeYoutuberId : null,
    live,
  }
}

/**
 * Check the admin level
 * @param {MemberRoleName} role - Hierarchy level
 * @return {boolean} - Sits at admin level
 */

export const isAdminRole = (role: MemberRoleName): boolean => role === MemberRoles.Admin
