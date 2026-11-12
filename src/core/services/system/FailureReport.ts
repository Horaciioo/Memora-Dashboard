import 'server-only'

import type { NextRequest } from 'next/server'

import { toAppError } from '@/core/lib/errors'
import { messageOf, traceOf } from '@/core/lib/errors/text'
import { recordError } from '@/core/services/system/ErrorEventService'
import { recordEvent } from '@/core/services/system/ActivityService'
import type { ActivityError } from '@/core/services/system/ActivityService'
import { FAILURE_SETTINGS } from '@/declarations/configurations/settings'
import { NEXUS_PATHS } from '@/declarations/nexus/paths'
import { ErrorCodes } from '@/utils/constants/errors'
import { SECOND_MS } from '@/utils/constants/time'

// Moments each failure was last kept
const lastKept = new Map<string, number>()

/**
 * Check a failure was kept lately
 * @param {string} key - Route and message
 * @return {boolean} - Already in the journal
 */

const isRecent = (key: string): boolean => {
  const now = Date.now()
  const last = lastKept.get(key)
  if (last !== undefined && now - last < FAILURE_SETTINGS.repeatWindowSeconds * SECOND_MS)
    return true

  // Keep the table small
  if (lastKept.size >= FAILURE_SETTINGS.repeatKeysMax) {
    lastKept.delete(lastKept.keys().next().value as string)
  }
  lastKept.set(key, now)

  return false
}

// Routes the journal never names
const isHiddenRoute = (request: NextRequest): boolean =>
  request.nextUrl.pathname.startsWith(NEXUS_PATHS.api)

/**
 * Keep an unexpected failure in the journal
 * @param {NextRequest} request - Failed request
 * @param {string | null} actorId - Signed-in member
 * @param {unknown} error - Thrown value
 * @return {Promise<void>} - Recorded
 */

export const reportFailure = async (
  request: NextRequest,
  actorId: string | null,
  error: unknown
): Promise<void> => {
  if (toAppError(error).code !== ErrorCodes.SystemFailure) return

  const route = `${request.method} ${request.nextUrl.pathname}`

  // The console keeps all of them, visitors included
  await recordError({ severity: 'ERROR', source: 'API', error, route, accountId: actorId })

  if (!actorId || isHiddenRoute(request)) return
  const message = messageOf(error)
  if (isRecent(`${route} ${message}`)) return

  const failure: ActivityError = { message, route, trace: traceOf(error) }

  // A journal failure never masks the real one
  await recordEvent({
    eventType: 'ErrorRaised',
    origin: 'System',
    actorId,
    summary: route,
    error: failure,
  }).catch(() => undefined)
}

// Refusals worth a trace
const REFUSALS = {
  [ErrorCodes.InsufficientPermissions]: 'AccessDenied',
  [ErrorCodes.RateLimited]: 'RateLimited',
} as const

/**
 * Keep a refused request in the journal
 * @param {NextRequest} request - Refused request
 * @param {string | null} actorId - Signed-in member
 * @param {unknown} error - Thrown value
 * @return {Promise<void>} - Recorded
 */

export const reportRefusal = async (
  request: NextRequest,
  actorId: string | null,
  error: unknown
): Promise<void> => {
  const code = toAppError(error).code
  if (!(code in REFUSALS) || isHiddenRoute(request)) return

  const route = `${request.method} ${request.nextUrl.pathname}`
  await recordError({
    severity: 'WARNING',
    source: 'API',
    message: `${code} ${route}`,
    route,
    accountId: actorId,
  })
  if (isRecent(`${code} ${actorId ?? ''} ${route}`)) return

  await recordEvent({
    eventType: REFUSALS[code as keyof typeof REFUSALS],
    origin: 'System',
    actorId,
    summary: route,
  }).catch(() => undefined)
}
