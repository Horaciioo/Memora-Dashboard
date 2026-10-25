import type { ColorVisionMode, FontScale, ThemePreference } from '@/declarations/access/preferences'
import type { FavoritePage } from '@/types/favorites'
import type { MemberRoleName, MemberStatusName } from '@/utils/constants/hierarchy'
import type { PermissionName } from '@/utils/constants/permissions'

// Permission identifier
export type Permission = PermissionName

// Real level and creators behind a view
export interface ActualIdentity {
  role: MemberRoleName
  isRoot: boolean
  youtuberIds: string[]
}

/**
 * Signed-in member exposed to the client
 * @typedef {Object} SessionUser
 * @property {string} id - Account identifier
 * @property {string} discordId - Discord identifier
 * @property {string} displayName - Display name
 * @property {string | null} avatarUrl - Avatar URL
 * @property {MemberRoleName} role - Hierarchy level
 * @property {MemberStatusName} status - Membership status
 * @property {string | null} divisionId - Division identifier
 * @property {string[]} youtuberIds - Assigned YouTubers
 * @property {string[]} functionIds - Functions held
 * @property {boolean} isRoot - Root administrator
 * @property {ActualIdentity} actual - Real identity behind a view
 * @property {DisplayPreferences} display - Display preferences
 * @property {number | null} historyConsentVersion - Consent version agreed to
 * @property {string | null} seenReleaseVersion - Last note read
 * @property {FavoritePage[]} favorites - Pages starred
 * @property {string | null} timezone - Zone clock times read in
 * @property {Permission[]} permissions - Granted permissions
 */

export interface SessionUser {
  id: string
  discordId: string
  displayName: string
  avatarUrl: string | null
  role: MemberRoleName
  status: MemberStatusName
  divisionId: string | null
  youtuberIds: string[]
  functionIds: string[]
  isRoot: boolean
  actual: ActualIdentity
  historyConsentVersion: number | null
  seenReleaseVersion: string | null
  favorites: FavoritePage[]
  display: DisplayPreferences
  timezone: string | null
  permissions: Permission[]
}

/**
 * Display preferences a member set once and carries to every browser
 * @typedef {Object} DisplayPreferences
 * @property {ThemePreference | null} theme - Light
 * @property {ColorVisionMode | null} colorVision - Colour vision correction
 * @property {FontScale | null} fontScale - Text size
 */

export interface DisplayPreferences {
  theme: ThemePreference | null
  colorVision: ColorVisionMode | null
  fontScale: FontScale | null
}

/**
 * Permission authorization helpers
 * @typedef {Object} PermissionHelpers
 * @property {(permission: Permission) => boolean} can - Holds a permission
 * @property {(permissions: Permission[]) => boolean} canAny - Holds any permission
 * @property {(permissions: Permission[]) => boolean} canAll - Holds every permission
 * @property {boolean} isAdmin - Sits at the admin level
 * @property {boolean} isGlobal - Reaches every creator, the admin and employee levels
 * @property {boolean} isSystem - Holds the system, the admin level only
 * @property {boolean} isResponsable - Sits at responsable level or above
 * @property {boolean} isRoot - Root administrator
 */

export interface PermissionHelpers {
  can: (permission: Permission) => boolean
  canAny: (permissions: Permission[]) => boolean
  canAll: (permissions: Permission[]) => boolean
  isAdmin: boolean
  isGlobal: boolean
  isSystem: boolean
  isResponsable: boolean
  isRoot: boolean
}
