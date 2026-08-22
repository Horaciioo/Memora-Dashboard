import type {
  AcademyPeriodName,
  MemberRoleName,
  MemberStatusName,
} from '@/utils/constants/hierarchy'
import type { PermissionName } from '@/utils/constants/permissions'

// Permission identifier
export type Permission = PermissionName

/**
 * Signed-in member exposed to the client
 * @typedef {Object} SessionUser
 * @property {string} id - Account identifier
 * @property {string} discordId - Discord identifier
 * @property {string} displayName - Display name
 * @property {string | null} avatarUrl - Avatar URL
 * @property {MemberRoleName} role - Hierarchy level
 * @property {MemberStatusName} status - Membership status
 * @property {AcademyPeriodName | null} academyPeriod - Academy progression
 * @property {string | null} divisionId - Division identifier
 * @property {string | null} youtuberId - Assigned YouTuber
 * @property {string | null} primaryFunctionId - Main function
 * @property {string | null} secondaryFunctionId - Secondary function
 * @property {boolean} isRoot - Root administrator
 * @property {Permission[]} permissions - Granted permissions
 */

export interface SessionUser {
  id: string
  discordId: string
  displayName: string
  avatarUrl: string | null
  role: MemberRoleName
  status: MemberStatusName
  academyPeriod: AcademyPeriodName | null
  divisionId: string | null
  youtuberId: string | null
  primaryFunctionId: string | null
  secondaryFunctionId: string | null
  isRoot: boolean
  permissions: Permission[]
}

/**
 * Permission authorization helpers
 * @typedef {Object} PermissionHelpers
 * @property {(permission: Permission) => boolean} can - Holds a permission
 * @property {(permissions: Permission[]) => boolean} canAny - Holds any permission
 * @property {(permissions: Permission[]) => boolean} canAll - Holds every permission
 * @property {boolean} isAdmin - Sits at the admin level
 * @property {boolean} isResponsable - Sits at responsable level or above
 * @property {boolean} isRoot - Root administrator
 */

export interface PermissionHelpers {
  can: (permission: Permission) => boolean
  canAny: (permissions: Permission[]) => boolean
  canAll: (permissions: Permission[]) => boolean
  isAdmin: boolean
  isResponsable: boolean
  isRoot: boolean
}
