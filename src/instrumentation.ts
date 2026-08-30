import type { Instrumentation } from 'next'

/**
 * Boot the server-side infrastructure once per process
 * @return {Promise<void>} - Started
 */

export const register = async (): Promise<void> => {
  // Each runtime loads its own Sentry entry, both delegating to the same init
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')

    return
  }

  // Only the Node.js runtime carries the managers, the edge one never loads them
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  await import('../sentry.server.config')

  const { startRuntime } = await import('@/managers/infrastructure/Core/runtime')

  try {
    await startRuntime()
  } catch (error) {
    // A failed boot must not take the server down on a non strict branch
    console.error('[instrumentation] infrastructure failed to start', error)
  }
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
}
