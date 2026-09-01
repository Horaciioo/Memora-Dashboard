import type { NavigationViewName } from '@/declarations/navigation'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Function paired with the permissions it carries
 * @typedef {Object} FunctionGrantsView
 * @property {string} id - Function identifier
 * @property {string} name - Function name
 * @property {string} kind - Primary or secondary
 * @property {PermissionName[]} permissions - Permissions carried
 */

export interface FunctionGrantsView {
  id: string
  name: string
  kind: string
  permissions: PermissionName[]
}

/**
 * Whole permission matrix
 * @typedef {Object} AccessMatrix
 * @property {Record<MemberRoleName, PermissionName[]>} roles - Grants per role
 * @property {FunctionGrantsView[]} functions - Grants per function
 */

export interface AccessMatrix {
  roles: Record<MemberRoleName, PermissionName[]>
  functions: FunctionGrantsView[]
}

/**
 * Responsable anchored on one creator
 * @typedef {Object} LeadAnchor
 * @property {string} accountId - Account identifier
 * @property {string} displayName - Display name
 * @property {string | null} avatarUrl - Portrait URL
 * @property {MemberRoleName} role - Hierarchy level
 * @property {string | null} teamId - Team the anchor narrows to
 * @property {string | null} teamName - Name of that team
 */

export interface LeadAnchor {
  accountId: string
  displayName: string
  avatarUrl: string | null
  role: MemberRoleName
  teamId: string | null
  teamName: string | null
}

/**
 * Creator one member is anchored on
 * @typedef {Object} CreatorLead
 * @property {string} id - Creator identifier
 * @property {string} name - Creator name
 * @property {string | null} handle - Channel handle
 * @property {string | null} accent - Stored colour
 * @property {string | null} avatarUrl - Portrait URL
 * @property {string | null} teamId - Team the anchor narrows to
 * @property {string | null} teamName - Name of that team
 */

export interface CreatorLead {
  id: string
  name: string
  handle: string | null
  accent: string | null
  avatarUrl: string | null
  teamId: string | null
  teamName: string | null
}

/**
 * View context
 * @typedef {Object} ViewContext
 * @property {NavigationViewName} view - View on screen
 * @property {NavigationViewName[]} available - Views the member may switch between
 * @property {CreatorLead[]} creators - Creators the member may pick between
 * @property {string | null} activeYoutuberId - Creator the view is narrowed to
 */

export interface ViewContext {
  view: NavigationViewName
  available: NavigationViewName[]
  creators: CreatorLead[]
  activeYoutuberId: string | null
}
