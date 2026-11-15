import 'server-only'

import { readNumberValue } from '@/core/lib/forms/values'
import type { ProtectedRouteContext, RouteContext } from '@/core/lib/http/route'
import type { ReviewTarget } from '@/core/services/unban/UnbanRequestService'
import type { UnbanCaller } from '@/core/services/unban/requests/caller'

/**
 * Caller behind a protected route, with the perimeter resolved
 * @param {Pick<ProtectedRouteContext, 'session' | 'access' | 'scope'>} context - Route context
 * @return {Promise<UnbanCaller>} - Rights, perimeter and member
 */

export const unbanCaller = async ({
  session,
  access,
  scope,
}: Pick<ProtectedRouteContext, 'session' | 'access' | 'scope'>): Promise<UnbanCaller> => ({
  access,
  scope: await scope(),
  actorId: session.id,
})

/**
 * Request and counter a review route acts on
 * @param {Pick<RouteContext, 'params' | 'body'>} context - Route context
 * @return {ReviewTarget} - Target
 */

export const reviewTarget = ({
  params,
  body,
}: Pick<RouteContext, 'params' | 'body'>): ReviewTarget => ({
  id: params.id,
  version: readNumberValue(body, 'version') ?? 0,
})
