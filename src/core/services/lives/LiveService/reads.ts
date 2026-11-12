import 'server-only'
import { prisma } from '@/core/lib/db'
import { forbidden, notFound } from '@/core/lib/errors'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { liveStartedKey } from '@/declarations/academy/welcome'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import type { LiveBeacon, LiveView } from '@/types/lives'
import { LiveStatuses, OPEN_LIVE_STATUSES } from '@/utils/constants/lives'
import type { LiveStatusName } from '@/utils/constants/lives'
import type { PermissionName } from '@/utils/constants/permissions'
import type { Prisma } from '@prisma/client'
import { HOUR_MS } from '@/utils/constants/time'
import { readLiveTemplates } from '@/core/services/lives/LiveService/forms'
import { LIVE_SHAPE, toView } from '@/core/services/lives/LiveService/shape'

/**
 * Only whoever announces lives may post, edit or drop one on the calendar
 * @param {Object} input - What is touched
 * @param {boolean} input.canAnnounce - Viewer holds the announce permission
 * @param {string | null} [input.templateId] - Template an entry is posted under
 * @param {string[]} [input.entryIds] - Entries edited or dropped
 * @return {Promise<void>} - Throws when a live is touched without the permission
 */

export const assertLiveAccess = async ({
  canAnnounce,
  templateId,
  entryIds = [],
}: {
  canAnnounce: boolean
  templateId?: string | null
  entryIds?: string[]
}): Promise<void> => {
  if (canAnnounce) return

  const [liveTemplates, lives] = await Promise.all([
    templateId ? readLiveTemplates() : null,
    entryIds.length > 0 ? prisma.live.count({ where: { calendarEventId: { in: entryIds } } }) : 0,
  ])
  if ((templateId && liveTemplates?.has(templateId)) || lives > 0) throw forbidden()
}

/**
 * Read the lives still announced or running
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} viewerId - Signed-in member
 * @param {PermissionName[]} held - Permissions held
 * @return {Promise<LiveView[]>} - Open lives
 */

export const listOpenLives = async (
  scope: AccessScope,
  viewerId: string,
  held: PermissionName[]
): Promise<LiveView[]> => {
  const rows = await prisma.live.findMany({
    where: scopedWhere('live', scope, { status: { in: [...OPEN_LIVE_STATUSES] } }),
    include: LIVE_SHAPE,
    orderBy: { plannedStartAt: 'asc' },
    take: LIVE_SETTINGS.maxOpenLives,
  })

  return rows.map((row) => toView(row, viewerId, held))
}

/**
 * Read the lives closed within the last day
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} viewerId - Signed-in member
 * @param {PermissionName[]} held - Permissions held
 * @return {Promise<LiveView[]>} - Lives closed lately, latest first
 */

export const listRecentLives = async (
  scope: AccessScope,
  viewerId: string,
  held: PermissionName[]
): Promise<LiveView[]> => {
  const since = new Date(Date.now() - LIVE_SETTINGS.recentHours * HOUR_MS)
  const rows = await prisma.live.findMany({
    where: scopedWhere('live', scope, { status: LiveStatuses.Ended, endedAt: { gte: since } }),
    include: LIVE_SHAPE,
    orderBy: { endedAt: 'desc' },
    take: LIVE_SETTINGS.maxOpenLives,
  })

  return rows.map((row) => toView(row, viewerId, held))
}

/**
 * Read the lives already over
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} viewerId - Signed-in member
 * @param {PermissionName[]} held - Permissions held
 * @param {number} limit - Lives read
 * @return {Promise<LiveView[]>} - Past lives
 */

export const listPastLives = async (
  scope: AccessScope,
  viewerId: string,
  held: PermissionName[],
  limit: number,
  onlyCoordinated = false
): Promise<LiveView[]> => {
  const rows = await prisma.live.findMany({
    where: scopedWhere('live', scope, {
      status: LiveStatuses.Ended,
      ...(onlyCoordinated && { coordinations: { some: { accountId: viewerId } } }),
    }),
    include: LIVE_SHAPE,
    orderBy: { endedAt: 'desc' },
    take: limit,
  })

  return rows.map((row) => toView(row, viewerId, held))
}

/**
 * Read one live
 * @param {string} id - Live identifier
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} viewerId - Signed-in member
 * @param {PermissionName[]} held - Permissions held
 * @return {Promise<LiveView>} - Live view
 */

export const readLive = async (
  id: string,
  scope: AccessScope,
  viewerId: string,
  held: PermissionName[]
): Promise<LiveView> => {
  const row = await prisma.live.findFirst({
    where: scopedWhere('live', scope, { id }),
    include: LIVE_SHAPE,
  })
  if (!row) throw notFound()

  return toView(row, viewerId, held)
}

/**
 * Status of one live, without the rest a heartbeat never reads
 * @param {string} id - Live identifier
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<LiveStatusName>} - Status
 */

export const readLiveStatus = async (id: string, scope: AccessScope): Promise<LiveStatusName> => {
  const row = await prisma.live.findFirst({
    where: scopedWhere('live', scope, { id }),
    select: { status: true },
  })
  if (!row) throw notFound()

  return row.status as LiveStatusName
}

/**
 * Read what the rail and the home show
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} viewerId - Signed-in member
 * @param {boolean} seesAll - Reads every live of the perimeter
 * @return {Promise<LiveBeacon | null>} - Beacon
 */

export const readBeacon = async (
  scope: AccessScope,
  viewerId: string,
  seesAll: boolean
): Promise<LiveBeacon | null> => {
  // A moderator only sees the lives they are called on
  const seat: Prisma.LiveWhereInput = seesAll ? {} : { members: { some: { accountId: viewerId } } }

  const rows = await prisma.live.findMany({
    where: scopedWhere('live', scope, { status: { in: [...OPEN_LIVE_STATUSES] }, ...seat }),
    select: {
      id: true,
      status: true,
      platform: true,
      plannedStartAt: true,
      youtuber: { select: { id: true, name: true, avatarUrl: true } },
      members: { where: { accountId: viewerId, reinforcement: true }, select: { accountId: true } },
    },
    orderBy: { plannedStartAt: 'asc' },
    take: LIVE_SETTINGS.maxOpenLives,
  })

  if (rows.length === 0) return null

  // The bubble tells each live once
  const account = await prisma.account.findUnique({
    where: { id: viewerId },
    select: { seenGuides: true },
  })
  const unseen = rows.find(
    (row) =>
      row.status === LiveStatuses.Live && !account?.seenGuides.includes(liveStartedKey(row.id))
  )

  return {
    unseenStart: unseen ? { id: unseen.id, creator: unseen.youtuber.name } : null,
    status: rows.some((row) => row.status === LiveStatuses.Live)
      ? LiveStatuses.Live
      : LiveStatuses.Announced,
    lives: rows.map((row) => ({
      id: row.id,
      creatorId: row.youtuber.id,
      creator: row.youtuber.name,
      creatorAvatar: row.youtuber.avatarUrl,
      platform: row.platform,
      status: row.status,
      plannedStartAt: row.plannedStartAt.toISOString(),
      isReinforcement: row.members.length > 0,
    })),
  }
}
