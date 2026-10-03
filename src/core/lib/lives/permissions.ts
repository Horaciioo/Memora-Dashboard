import { LIVE_COORDINATOR } from '@/declarations/lives/registries'
import { OPEN_LIVE_STATUSES } from '@/utils/constants/lives'
import type { LiveStatusName } from '@/utils/constants/lives'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Whether a live still runs or waits
 * @param {LiveStatusName} status - Live status
 * @return {boolean} - Open
 */

export const isOpenLive = (status: LiveStatusName): boolean => OPEN_LIVE_STATUSES.includes(status)

/**
 * Fold the coordinator rights into what a viewer holds
 * @param {Object} live - Live coordinates
 * @param {string | null} live.coordinatorId - Coordinator account
 * @param {LiveStatusName} live.status - Live status
 * @param {string} viewerId - Signed-in member
 * @param {PermissionName[]} held - Permissions held
 * @return {PermissionName[]} - Permissions on this live
 */

export const livePermissions = (
  live: { coordinatorId: string | null; status: LiveStatusName },
  viewerId: string,
  held: PermissionName[]
): PermissionName[] => {
  // Coordinator rights only while the live is not over
  const coordinates = live.coordinatorId === viewerId && isOpenLive(live.status)
  if (!coordinates) return held

  return [...new Set([...held, ...LIVE_COORDINATOR.grants])]
}
