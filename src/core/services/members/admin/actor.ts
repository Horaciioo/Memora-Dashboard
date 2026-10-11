import 'server-only'

import { forbidden } from '@/core/lib/errors'
import type { ProtectedRouteContext } from '@/core/lib/http/route'
import { assertAccountInScope } from '@/core/services/auth/ScopeService'
import type { AdminActor } from '@/core/services/members/admin/guards'

/**
 * Who acts on a file, refused unless they lead and see the file
 * @param {Pick<ProtectedRouteContext, 'params' | 'session' | 'access' | 'scope'>} context - Route context
 * @return {Promise<AdminActor>} - Actor
 */

export const resolveActor = async ({
  params,
  session,
  access,
  scope,
}: Pick<ProtectedRouteContext, 'params' | 'session' | 'access' | 'scope'>): Promise<AdminActor> => {
  if (!access.isResponsable) throw forbidden()
  await assertAccountInScope(params.id, await scope(), session.id)

  return { id: session.id, isAdmin: access.isAdmin }
}
