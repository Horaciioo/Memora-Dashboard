import { GRANT_ADDITIONS } from '@/declarations/access/grants'
import { LIVE_COORDINATOR } from '@/declarations/lives/registries'
import { MemberRoles } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Seat a preview can be seen from
 * @typedef {'ADMIN' | 'RESPONSABLE' | 'COORDINATOR' | 'MODERATEUR' | 'JUNIOR'} PreviewSeat
 */

export type PreviewSeat = MemberRoleName | 'COORDINATOR'

// Live grants as declared, floor role included everywhere
const LIVE_GRANTS =
  GRANT_ADDITIONS.find((addition) => addition.key === 'live-modview')?.grants ?? {}
const FLOOR = LIVE_GRANTS[MemberRoles.Moderateur] ?? []

/**
 * Permissions a seat holds on a live, as declared in code
 * @param {PreviewSeat} seat - Seat
 * @return {PermissionName[]} - Permissions
 */

export const previewPermissions = (seat: PreviewSeat): PermissionName[] => {
  if (seat === 'COORDINATOR') return [...new Set([...FLOOR, ...LIVE_COORDINATOR.grants])]

  return [...new Set([...FLOOR, ...(LIVE_GRANTS[seat] ?? [])])]
}
