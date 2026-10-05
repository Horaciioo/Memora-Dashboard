import type { LiveBeacon } from '@/types/lives'
import type { PermissionOverwrite } from '@/core/lib/permissions'
import type { NavigationViewName } from '@/declarations/navigation'
import type { AccessCategoryName, MemberRoleName } from '@/utils/constants/hierarchy'
import type { PermissionName } from '@/utils/constants/permissions'
import type { FunctionKindName } from '@/utils/constants/workflow'

/**
 * Hierarchy level as a row of the access console
 * @typedef {Object} RoleGrantsView
 * @property {MemberRoleName} role - Hierarchy level
 * @property {string} label - Display name
 * @property {string} accent - Colour token
 * @property {string | null} icon - Glyph key
 * @property {boolean} locked - Only an admin writes this level
 * @property {AccessCategoryName} category - Rail section it heads
 * @property {boolean} isFloor - Its grants are the base every overwrite resolves against
 * @property {number} members - Accounts carrying it
 * @property {PermissionOverwrite[]} permissions - Overwrites carried on the open layer
 * @property {PermissionName[]} baseline - Permissions the layer below already grants
 */

export interface RoleGrantsView {
  role: MemberRoleName
  label: string
  accent: string
  icon: string | null
  locked: boolean
  category: AccessCategoryName
  isFloor: boolean
  members: number
  permissions: PermissionOverwrite[]
  baseline: PermissionName[]
}

/**
 * Function as a row of the access console
 * @typedef {Object} FunctionGrantsView
 * @property {string} id - Function identifier
 * @property {string} name - Function name
 * @property {AccessCategoryName} category - Rail section it sits under
 * @property {FunctionKindName} kind - Primary or secondary holder slot
 * @property {string | null} accent - Stored colour
 * @property {string | null} icon - Glyph key
 * @property {string | null} summary - Short description
 * @property {number} holders - Accounts assigned to it
 * @property {PermissionOverwrite[]} permissions - Overwrites carried on the open layer
 * @property {PermissionName[]} baseline - Permissions its category already grants
 */

export interface FunctionGrantsView {
  id: string
  name: string
  category: AccessCategoryName
  kind: FunctionKindName
  accent: string | null
  icon: string | null
  summary: string | null
  holders: number
  permissions: PermissionOverwrite[]
  baseline: PermissionName[]
}

/**
 * Account shown in a role or function roster
 * @typedef {Object} AccessMemberView
 * @property {string} id - Account identifier
 * @property {string} displayName - Display name
 * @property {string | null} avatarUrl - Portrait URL
 * @property {MemberRoleName} role - Hierarchy level
 * @property {string[]} functionIds - Functions held
 */

export interface AccessMemberView {
  id: string
  displayName: string
  avatarUrl: string | null
  role: MemberRoleName
  functionIds: string[]
}

/**
 * Creator with the functions it opens
 * @typedef {Object} CreatorPerimeterView
 * @property {string} id - Creator identifier
 * @property {string} name - Creator name
 * @property {string | null} handle - Channel handle
 * @property {string | null} accent - Stored colour
 * @property {string | null} avatarUrl - Portrait URL
 * @property {string[]} functionIds - Functions the creator opens
 * @property {number} members - Accounts attached to the creator
 */

export interface CreatorPerimeterView {
  id: string
  name: string
  handle: string | null
  accent: string | null
  avatarUrl: string | null
  functionIds: string[]
  members: number
}

/**
 * Everything the access console renders
 * @typedef {Object} AccessConsole
 * @property {RoleGrantsView[]} roles - Hierarchy levels
 * @property {FunctionGrantsView[]} functions - Functions
 * @property {AccessMemberView[]} roster - Active accounts
 * @property {CreatorPerimeterView[]} perimeter - Creators and the functions they open
 * @property {string | null} youtuberId - Creator the open overwrite layer belongs to
 */

export interface AccessConsole {
  roles: RoleGrantsView[]
  functions: FunctionGrantsView[]
  roster: AccessMemberView[]
  perimeter: CreatorPerimeterView[]
  youtuberId: string | null
}

/**
 * Effective access of a role or function
 * @typedef {Object} AccessSimulation
 * @property {string} label - Name of the holder being simulated
 * @property {PermissionName[]} permissions - Permissions the holder effectively resolves to
 * @property {string | null} youtuberId - Creator the simulation is narrowed to
 */

export interface AccessSimulation {
  label: string
  permissions: PermissionName[]
  youtuberId: string | null
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
 * @property {boolean} switchable - Lightning shows
 * @property {CreatorLead[]} creators - Creators the member may pick between
 * @property {string | null} activeYoutuberId - Creator the view is narrowed to
 */

export interface ViewContext {
  view: NavigationViewName
  available: NavigationViewName[]
  switchable: boolean
  creators: CreatorLead[]
  activeYoutuberId: string | null
  // Open lives lighting the Livecon entry
  live: LiveBeacon | null
}
