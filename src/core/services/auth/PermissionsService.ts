import type { PermissionHelpers, SessionUser } from '@/types/auth'
import { MemberRoles } from '@/utils/constants/hierarchy'
import { hasEveryPermission, hasPermission } from '@/utils/constants/permissions'
import { ROLE_REGISTRY } from '@/declarations/access/roles'

/**
 * Resolve permission helpers
 * @param {SessionUser | null} session - Session
 * @return {PermissionHelpers} - Helpers
 */

export const resolvePermissions = (session: SessionUser | null): PermissionHelpers => {
  const permissions = session?.permissions ?? []
  const isRoot = session?.isRoot ?? false
  const rank = session ? ROLE_REGISTRY.get(session.role).rank : 0

  return {
    // The root administrator is never gated
    can: (permission) => isRoot || hasPermission(permissions, permission),
    canAny: (list) => isRoot || hasPermission(permissions, list),
    canAll: (list) => isRoot || hasEveryPermission(permissions, list),
    isAdmin: isRoot || session?.role === MemberRoles.Admin,
    isResponsable: rank >= ROLE_REGISTRY.get(MemberRoles.Responsable).rank,
    isRoot,
  }
}
