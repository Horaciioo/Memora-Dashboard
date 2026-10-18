import type { PermissionHelpers, SessionUser } from '@/types/auth'
import { MemberRoles } from '@/utils/constants/hierarchy'
import { Permissions, hasEveryPermission, hasPermission } from '@/utils/constants/permissions'
import { ROLE_REGISTRY } from '@/declarations/access/roles'

// Closed to every role below Responsable
const FLOOR_BLOCKED = new Set<string>([
  Permissions.CommunicationRead,
  Permissions.CommunicationWrite,
])

/**
 * Resolve permission helpers
 * @param {SessionUser | null} session - Session
 * @return {PermissionHelpers} - Helpers
 */

export const resolvePermissions = (session: SessionUser | null): PermissionHelpers => {
  const isRoot = session?.isRoot ?? false
  const rank = session ? ROLE_REGISTRY.get(session.role).rank : 0
  const isLead = rank >= ROLE_REGISTRY.get(MemberRoles.Responsable).rank
  // Announcements never reach the floor, whatever a function grants
  const permissions = (session?.permissions ?? []).filter(
    (name) => isLead || !FLOOR_BLOCKED.has(name)
  )

  return {
    // The root administrator is never gated
    can: (permission) => isRoot || hasPermission(permissions, permission),
    canAny: (list) => isRoot || hasPermission(permissions, list),
    canAll: (list) => isRoot || hasEveryPermission(permissions, list),
    isAdmin: isRoot || session?.role === MemberRoles.Admin,
    isResponsable: isLead,
    isRoot,
  }
}
