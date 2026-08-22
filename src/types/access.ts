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
