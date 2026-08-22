import 'server-only'

import { redirect } from 'next/navigation'

import { getSession } from '@/core/lib/auth/getSession'
import { resolvePermissions } from '@/core/services/auth/PermissionsService'
import { ROUTES } from '@/declarations/navigation'
import type { PermissionHelpers, Permission, SessionUser } from '@/types/auth'

/**
 * Session paired with its permission helpers
 * @typedef {Object} GuardedSession
 * @property {SessionUser} session - Signed-in member
 * @property {PermissionHelpers} access - Permission helpers
 */

export interface GuardedSession {
  session: SessionUser
  access: PermissionHelpers
}

/**
 * Require a signed-in member
 * @return {Promise<GuardedSession>} - Session and helpers
 */

export const requireUser = async (): Promise<GuardedSession> => {
  const session = await getSession()
  if (!session) redirect(ROUTES.login)

  return { session, access: resolvePermissions(session) }
}

/**
 * Require a permission on a server component
 * @param {Permission | Permission[]} permission - Permission needed
 * @return {Promise<GuardedSession>} - Session and helpers
 */

export const requirePermission = async (
  permission: Permission | Permission[]
): Promise<GuardedSession> => {
  const guarded = await requireUser()
  const allowed = Array.isArray(permission)
    ? guarded.access.canAny(permission)
    : guarded.access.can(permission)

  if (!allowed) redirect(ROUTES.home)

  return guarded
}

/**
 * Read the member without forcing a redirect
 * @return {Promise<SessionUser | null>} - Session user or null
 */

export const optionalUser = async (): Promise<SessionUser | null> => getSession()
