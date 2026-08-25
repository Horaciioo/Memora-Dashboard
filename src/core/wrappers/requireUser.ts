import 'server-only'

import { redirect } from 'next/navigation'

import { getSession } from '@/core/lib/auth/getSession'
import { resolvePermissions } from '@/core/services/auth/PermissionsService'
import { readScope } from '@/core/services/auth/ScopeService'
import { ROUTES } from '@/declarations/navigation'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import type { PermissionHelpers, Permission, SessionUser } from '@/types/auth'
import type { MemberStatusName } from '@/utils/constants/hierarchy'

/**
 * Session paired with its permission helpers
 * @typedef {Object} GuardedSession
 * @property {SessionUser} session - Signed-in member
 * @property {PermissionHelpers} access - Permission helpers
 * @property {() => Promise<AccessScope>} scope - Creator perimeter, resolved on demand
 */

export interface GuardedSession {
  session: SessionUser
  access: PermissionHelpers
  scope: () => Promise<AccessScope>
}

/**
 * Require a signed-in member
 * @return {Promise<GuardedSession>} - Session and helpers
 */

export const requireUser = async (): Promise<GuardedSession> => {
  const session = await getSession()
  if (!session) redirect(ROUTES.login)

  const access = resolvePermissions(session)

  return { session, access, scope: () => readScope(session, access) }
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
 * Require a membership status on a server component, a rail entry hidden by
 * visibleWhen still being reachable by direct URL without it
 * @param {MemberStatusName | MemberStatusName[]} status - Statuses the page is meant for
 * @return {Promise<GuardedSession>} - Session and helpers
 */

export const requireStatus = async (
  status: MemberStatusName | MemberStatusName[]
): Promise<GuardedSession> => {
  const guarded = await requireUser()
  const allowed = Array.isArray(status) ? status : [status]

  if (!allowed.includes(guarded.session.status)) redirect(ROUTES.home)

  return guarded
}

/**
 * Read the member without forcing a redirect
 * @return {Promise<SessionUser | null>} - Session user or null
 */

export const optionalUser = async (): Promise<SessionUser | null> => getSession()
