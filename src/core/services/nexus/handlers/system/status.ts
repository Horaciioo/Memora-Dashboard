import 'server-only'

import pkg from '@/../package.json'
import { prisma } from '@/core/lib/db'
import { realtimeSocketCount } from '@/core/lib/realtime/server'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { readHealthReport } from '@/core/services/system/HealthService'
import { readMaintenance } from '@/core/services/system/MaintenanceModeService'
import { readRuntimeReport } from '@/core/services/system/ConsoleService'
import { runtime } from '@/managers/infrastructure/Core/runtime'

// Process start, as a date
const STARTED_AT = new Date(Date.now() - process.uptime() * 1000).toISOString()

const status: NexusHandler = async () => {
  const [health, maintenance, consoles] = await Promise.all([
    readHealthReport(),
    readMaintenance(),
    prisma.nexusSession.count({
      where: { stage: 'UNLOCKED', revokedAt: null, expiresAt: { gt: new Date() } },
    }),
  ])
  const report = readRuntimeReport()
  const container = runtime()

  return {
    output: {
      environment: report.environment,
      version: pkg.version,
      startedAt: STARTED_AT,
      memoryRssMb: Math.round(health.memory.rss / 1048576),
      heapUsedMb: Math.round(health.memory.heapUsed / 1048576),
      loopDelayMs: health.processor.loop,
      sockets: realtimeSocketCount(),
      queues: container?.queues.isReady() ?? false,
      redis: container?.redis.isReady() ?? false,
      databaseBytes: health.database.bytes,
      databaseConnections: health.database.connections,
      maintenance: maintenance.enabled,
      nexusSessions: consoles,
    },
  }
}

/**
 * Process status of the system module
 * @type {Record<string, NexusHandler>}
 */

export const STATUS_HANDLERS: Record<string, NexusHandler> = { 'system.status': status }
