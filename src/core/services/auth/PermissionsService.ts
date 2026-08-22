import type { PermissionHelpers, SessionUser } from '@/types/auth'
import { hasEveryPermission, hasPermission } from '@/utils/constants/permissions'

/**
 * Resolve permissions
 * @param {SessionUser | null} session - Session
 * @return {PermissionHelpers} - Helpers
 */

export const resolvePermissions = (session: SessionUser | null): PermissionHelpers => {
  const permissions = session?.permissions ?? []

  return {
    can: (permission) => hasPermission(permissions, permission),
    canAny: (list) => hasPermission(permissions, list),
    canAll: (list) => hasEveryPermission(permissions, list),
    isAdmin: session?.role === 'admin',
    isReadOnly: session?.role !== 'admin',
  }
}
