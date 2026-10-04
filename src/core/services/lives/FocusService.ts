import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, notFound } from '@/core/lib/errors'
import { livePermissions } from '@/core/lib/lives/permissions'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { JUNIOR_FUNCTION_OF } from '@/declarations/reference/fixed'
import { LIVE_FUNCTIONS } from '@/declarations/lives/registries'
import type { LiveFocusView } from '@/types/lives'
import { AcademyJuniorStatuses, MemberRoles } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import type { LivePlatformName, LiveStatusName } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

// Seats that follow anyone and see every Focus
const OVERSEERS: MemberRoleName[] = [MemberRoles.Admin, MemberRoles.Responsable]

// Junior functions of the live trades, the only ones a trainer may follow
const JUNIOR_LIVE_FUNCTIONS = LIVE_FUNCTIONS.map((name) => JUNIOR_FUNCTION_OF[name]).filter(
  (name): name is string => Boolean(name)
)

/**
 * Load a live in the perimeter with what a Focus checks
 * @param {string} liveId - Live
 * @param {AccessScope} scope - Viewer perimeter
 * @return {Promise<object>} - Live row
 */

const liveInScope = async (liveId: string, scope: AccessScope) => {
  const live = await prisma.live.findFirst({
    where: scopedWhere('live', scope, { id: liveId }),
    select: { id: true, status: true, coordinatorId: true, platform: true },
  })
  if (!live) throw notFound()

  return live
}

/**
 * Whether a member currently follows another on a live
 * @param {string} liveId - Live
 * @param {string} watcherId - Follower
 * @param {string} targetId - Followed member
 * @return {Promise<boolean>} - Focus open
 */

export const isFollowing = async (
  liveId: string,
  watcherId: string,
  targetId: string
): Promise<boolean> => {
  const count = await prisma.modViewFocus.count({
    where: { liveId, watcherId, targetId, endedAt: null },
  })

  return count > 0
}

/**
 * Read the Focus a viewer may see: every one for an overseer, their own otherwise
 * @param {Object} input - Reader
 * @param {string} input.liveId - Live
 * @param {AccessScope} input.scope - Viewer perimeter
 * @param {string} input.viewerId - Signed-in member
 * @param {MemberRoleName} input.role - Viewer role
 * @return {Promise<LiveFocusView[]>} - Open Focus
 */

export const listFocuses = async ({
  liveId,
  scope,
  viewerId,
  role,
}: {
  liveId: string
  scope: AccessScope
  viewerId: string
  role: MemberRoleName
}): Promise<LiveFocusView[]> => {
  const live = await liveInScope(liveId, scope)

  const rows = await prisma.modViewFocus.findMany({
    where: {
      liveId,
      endedAt: null,
      // A trainer never sees another Focus, nor a responsable's
      ...(OVERSEERS.includes(role) ? {} : { watcherId: viewerId }),
    },
    include: {
      watcher: { select: { id: true, displayName: true } },
      target: {
        select: {
          id: true,
          displayName: true,
          platformAccounts: {
            where: { platform: live.platform },
            select: { login: true },
          },
        },
      },
    },
    orderBy: { startedAt: 'asc' },
  })

  return rows.map((row) => ({
    id: row.id,
    watcherId: row.watcher.id,
    watcherName: row.watcher.displayName,
    targetId: row.target.id,
    targetName: row.target.displayName,
    targetLogin: row.target.platformAccounts[0]?.login ?? null,
    startedAt: row.startedAt.toISOString(),
  }))
}

/**
 * Follow a member on a live, a trainer only reaching the juniors
 * @param {Object} input - Focus
 * @param {string} input.liveId - Live
 * @param {string} input.targetId - Member followed
 * @param {AccessScope} input.scope - Viewer perimeter
 * @param {string} input.viewerId - Follower
 * @param {MemberRoleName} input.role - Follower role
 * @param {PermissionName[]} input.held - Permissions held
 * @return {Promise<void>} - Following
 */

export const startFocus = async ({
  liveId,
  targetId,
  scope,
  viewerId,
  role,
  held,
}: {
  liveId: string
  targetId: string
  scope: AccessScope
  viewerId: string
  role: MemberRoleName
  held: PermissionName[]
}): Promise<void> => {
  const live = await liveInScope(liveId, scope)
  const permissions = livePermissions(
    { coordinatorId: live.coordinatorId, status: live.status as LiveStatusName },
    viewerId,
    held
  )
  if (!permissions.includes(Permissions.LiveFocus) || targetId === viewerId) throw forbidden()
  if (!OVERSEERS.includes(role)) {
    const [junior] = await focusableMembers([targetId], role)
    if (!junior) throw forbidden()
  }

  // One Focus at a time per follower and live
  await prisma.$transaction([
    prisma.modViewFocus.updateMany({
      where: { liveId, watcherId: viewerId, endedAt: null },
      data: { endedAt: new Date() },
    }),
    prisma.modViewFocus.create({ data: { liveId, watcherId: viewerId, targetId } }),
  ])
}

/**
 * Stop following on a live
 * @param {string} liveId - Live
 * @param {string} viewerId - Follower
 * @return {Promise<void>} - Stopped
 */

export const stopFocus = async (liveId: string, viewerId: string): Promise<void> => {
  await prisma.modViewFocus.updateMany({
    where: { liveId, watcherId: viewerId, endedAt: null },
    data: { endedAt: new Date() },
  })
}

/**
 * Platform login of a member, for the gestures they make
 * @param {string} accountId - Member
 * @param {LivePlatformName} platform - Platform
 * @return {Promise<string | null>} - Login, none when unlinked
 */

export const platformLoginOf = async (
  accountId: string,
  platform: LivePlatformName
): Promise<string | null> => {
  const row = await prisma.platformAccount.findUnique({
    where: { accountId_platform: { accountId, platform } },
    select: { login: true },
  })

  return row?.login ?? null
}

/**
 * Members a viewer may follow among a live's team
 * @param {string[]} memberIds - Convened team
 * @param {MemberRoleName} role - Viewer role
 * @return {Promise<string[]>} - Members open to a Focus
 */

export const focusableMembers = async (
  memberIds: string[],
  role: MemberRoleName
): Promise<string[]> => {
  if (OVERSEERS.includes(role)) return memberIds

  // A trainer only follows the juniors
  const juniors = await prisma.account.findMany({
    where: {
      id: { in: memberIds },
      OR: [
        { functions: { some: { jobFunction: { name: { in: JUNIOR_LIVE_FUNCTIONS } } } } },
        { academyJuniors: { some: { status: AcademyJuniorStatuses.Active } } },
      ],
    },
    select: { id: true },
  })

  return juniors.map((junior) => junior.id)
}
