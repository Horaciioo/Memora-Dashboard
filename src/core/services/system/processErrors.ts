import 'server-only'

import { recordError } from '@/core/services/system/ErrorEventService'

// Survives dev hot reloads
const globalForWatch = globalThis as unknown as { processErrorsWatched?: boolean }

/**
 * Keep unhandled rejections and uncaught exceptions
 * @return {void}
 */

export const watchProcessErrors = (): void => {
  if (globalForWatch.processErrorsWatched) return
  globalForWatch.processErrorsWatched = true

  process.on('unhandledRejection', (reason) => {
    void recordError({
      severity: 'ERROR',
      source: 'SERVER',
      error: reason,
      route: 'unhandledRejection',
    })
  })
  process.on('uncaughtException', (error) => {
    void recordError({ severity: 'FATAL', source: 'SERVER', error, route: 'uncaughtException' })
  })
}
