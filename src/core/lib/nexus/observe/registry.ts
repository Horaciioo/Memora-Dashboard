import 'server-only'

import { createRing } from '@/core/lib/nexus/observe/ring'
import type { LogRing } from '@/core/lib/nexus/observe/ring'
import { createSeries } from '@/core/lib/nexus/observe/metrics'
import type { MetricSeries } from '@/core/lib/nexus/observe/metrics'
import { NEXUS_OBSERVABILITY } from '@/declarations/nexus/observability'

/**
 * Everything counted in this process
 * @typedef {Object} ObservabilityStore
 * @property {MetricSeries} http - Requests by route
 * @property {MetricSeries} prisma - Queries by model and operation
 * @property {MetricSeries} websocket - Requests by operation
 * @property {MetricSeries} jobs - Jobs by queue
 * @property {LogRing} logs - Recent technical lines
 */

export interface ObservabilityStore {
  http: MetricSeries
  prisma: MetricSeries
  websocket: MetricSeries
  jobs: MetricSeries
  logs: LogRing
}

// Survives dev hot reloads
const globalForStore = globalThis as unknown as { observability?: ObservabilityStore }

// Longest window kept
const KEEP_MS = Math.max(...NEXUS_OBSERVABILITY.windowsMinutes) * 60_000

const build = (): ObservabilityStore => {
  const series = () => createSeries(KEEP_MS, NEXUS_OBSERVABILITY.routeKeysMax)

  return {
    http: series(),
    prisma: series(),
    websocket: series(),
    jobs: series(),
    logs: createRing(NEXUS_OBSERVABILITY.logBuffer),
  }
}

/**
 * Counters of this process
 * @type {ObservabilityStore}
 */

export const OBSERVABILITY = (globalForStore.observability ??= build())
