import 'server-only'

import { Prisma } from '@prisma/client'

import { readRequestId } from '@/core/lib/http/requestOrigin'
import { OBSERVABILITY } from '@/core/lib/nexus/observe/registry'
import { logger } from '@/core/lib/logger'
import { NEXUS_OBSERVABILITY } from '@/declarations/nexus/observability'

// Table the report itself writes to
const SELF_MODEL = 'ErrorEvent'

// Reports go out late so a slow query never waits on them
const report = (model: string, operation: string, elapsed: number): void => {
  const requestId = readRequestId()
  logger.warn(
    `[prisma] slow ${model}.${operation} ${Math.round(elapsed)}ms request=${requestId ?? '-'}`
  )

  void import('@/core/services/system/ErrorEventService').then(({ recordError }) =>
    recordError({
      severity: 'WARNING',
      source: 'PRISMA',
      message: `Slow query ${model}.${operation}`,
      route: `${model}.${operation}`,
      // Names and time only, never the values
      context: { model, operation, durationMs: Math.round(elapsed) },
    })
  )
}

/**
 * Time each query, flag slow ones and class failures
 * @type {ReturnType<typeof Prisma.defineExtension>}
 */

export const nexusQueryExtension = Prisma.defineExtension({
  name: 'nexus-query',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (model === SELF_MODEL) return query(args)

        const startedAt = performance.now()
        try {
          return await query(args)
        } catch (error) {
          OBSERVABILITY.prisma.add(`${model}.${operation}`, performance.now() - startedAt, true)
          void import('@/core/services/system/ErrorEventService').then(({ recordError }) =>
            recordError({
              severity: 'ERROR',
              source: 'PRISMA',
              error,
              route: `${model}.${operation}`,
              context: { model, operation },
            })
          )
          throw error
        } finally {
          const elapsed = performance.now() - startedAt
          OBSERVABILITY.prisma.add(`${model}.${operation}`, elapsed)
          if (elapsed > NEXUS_OBSERVABILITY.slowQueryMs) report(model, operation, elapsed)
        }
      },
    },
  },
})
