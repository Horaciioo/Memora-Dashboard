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

// Live batches as declared
const LIVE_BATCHES = GRANT_ADDITIONS.filter((addition) =>
  ['live-modview', 'live-chat-modes-by-seat'].includes(addition.key)
)

// Permissions a role holds, denies apart
const grantsOf = (role: MemberRoleName): PermissionName[] =>
  LIVE_BATCHES.flatMap((batch) => batch.grants[role] ?? [])
const deniesOf = (role: MemberRoleName): PermissionName[] =>
  LIVE_BATCHES.flatMap((batch) => batch.roleDenies?.[role] ?? [])
const FLOOR = grantsOf(MemberRoles.Moderateur)

/**
 * Permissions a seat holds on a live
 * @param {PreviewSeat} seat - Seat
 * @return {PermissionName[]} - Permissions
 */

export const previewPermissions = (seat: PreviewSeat): PermissionName[] => {
  if (seat === 'COORDINATOR') return [...new Set([...FLOOR, ...LIVE_COORDINATOR.grants])]

  const denied = deniesOf(seat)

  return [...new Set([...FLOOR, ...grantsOf(seat)])].filter((entry) => !denied.includes(entry))
}
