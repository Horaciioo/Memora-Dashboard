import type { Instrumentation } from 'next'

/**
 * Boot the server-side infrastructure once per process
 * @return {Promise<void>} - Started
 */

export const register = async (): Promise<void> => {
  // Each runtime loads its own Sentry entry
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')

    return
  }

  // Only the Node.js runtime carries the managers
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  // Servers run in UTC, the team does not
  const { APP_TIME_ZONE } = await import('@/declarations/app')
  process.env.TZ = APP_TIME_ZONE

  await import('../sentry.server.config')

  // Owner settings first, readers run once
  const { loadConfigOverlay } = await import('@/core/lib/configuration/loadOverlay')
  await loadConfigOverlay()

  const { startRuntime } = await import('@/managers/infrastructure/Core/runtime')

  try {
    await startRuntime()
  } catch (error) {
    // A failed boot must not take the server down on a non strict branch
    console.error('[instrumentation] infrastructure failed to start', error)
  }

  // Nothing escapes unseen
  const { watchProcessErrors } = await import('@/core/services/system/processErrors')
  watchProcessErrors()

  // Sockets work without Redis, signals then stay in this process
  const { wireRealtime } = await import('@/core/lib/realtime/server')
  wireRealtime()
}

/**
 * Report a server-side exception
 * @param {unknown} error - Caught exception
 * @param {Instrumentation.RequestInfo} request - Failing request
 * @param {Instrumentation.ErrorContext} context - Where it failed
 * @return {Promise<void>} - Reported
 */

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const { captureRequestError } = await import('@/core/lib/sentry')

  captureRequestError(error, request, context)

  // Rendering failures reach the console too
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { recordError } = await import('@/core/services/system/ErrorEventService')
    await recordError({
      severity: 'ERROR',
      source: 'SERVER',
      error,
      route: `${request.method} ${request.path}`,
      context: { routeType: context.routeType, routePath: context.routePath },
    })
  }
}
