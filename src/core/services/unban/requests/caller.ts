import type { AccessScope } from '@/core/services/auth/ScopeService'
import type { PermissionHelpers } from '@/types/auth'

/**
 * Who acts on a request, with the rights and perimeter they hold
 * @typedef {Object} UnbanCaller
 * @property {PermissionHelpers} access - Rights
 * @property {AccessScope} scope - Creator perimeter
 * @property {string} actorId - Member acting
 */

export interface UnbanCaller {
  access: PermissionHelpers
  scope: AccessScope
  actorId: string
}
