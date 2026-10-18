import { ModViewProfiles } from '@/declarations/modview/profiles'
import type { ModViewProfileName } from '@/declarations/modview/profiles'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Seat a member holds on a live, read from the permissions
 * @param {PermissionName[]} permissions - Held on the live
 * @return {ModViewProfileName} - Seat
 */

export const profileOfPermissions = (permissions: PermissionName[]): ModViewProfileName => {
  // Only the Admin talks in Livecon 1
  if (permissions.includes(Permissions.LiveCrisisChat)) return ModViewProfiles.Admin
  if (permissions.includes(Permissions.LiveRoster)) return ModViewProfiles.Lead
  if (permissions.includes(Permissions.LiveFocus)) return ModViewProfiles.Trainer

  return ModViewProfiles.Moderator
}
