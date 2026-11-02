import 'server-only'

import os from 'node:os'
import { performance } from 'node:perf_hooks'
import v8 from 'node:v8'

import { prisma } from '@/core/lib/db'
import { readAvailableMemory } from '@/core/lib/system/hostMemory'
import { liveListenerCount } from '@/core/lib/lives/bus'
import { realtimeSocketCount } from '@/core/lib/realtime/server'
import { openDocCount } from '@/core/lib/realtime/server/docs'
import { presenceSeatCount } from '@/core/lib/realtime/server/presence'
import { readStorageReport } from '@/core/services/system/ConsoleService'
import { HEALTH_SETTINGS } from '@/declarations/system/monitoring/health'
import { MICROSECONDS_PER_MS } from '@/utils/constants/time'

/**
 * One line of a ranking
 * @typedef {Object} RankedLoad
 * @property {string} label - What weighs
 * @property {number} bytes - Weight
 * @property {number} [rows] - Rows held, for a table
 */

export interface RankedLoad {
  label: string
  bytes: number
  rows?: number
}

/**
 * Health report
 * @typedef {Object} HealthReport
 * @property {string} takenAt - ISO moment of the measure
 * @property {Object} memory - Memory of the process and of the server
 * @property {Object} processor - Processor and event loop
 * @property {Object} database - Database size, connections and cache
 * @property {Object} now - What is open at this instant
 * @property {{ heap: RankedLoad[], tables: RankedLoad[], buckets: RankedLoad[] }} heaviest - Rankings
 */

export interface HealthReport {
  takenAt: string
  memory: {
    rss: number
    heapUsed: number
    heapLimit: number
    offHeap: number
    hostFree: number
    hostTotal: number
  }
  processor: { cpu: number; loop: number; load: number; uptimeSeconds: number }
  database: { bytes: number; connections: number; maxConnections: number; cacheHit: number | null }
  now: {
    sessions: number
    readers: number
    sockets: number
    presence: number
    docs: number
    files: number
  }
  heaviest: { heap: RankedLoad[]; tables: RankedLoad[]; buckets: RankedLoad[] }
}

// Last processor sample, the share is read between two measures
let lastCpu: { at: number; usage: NodeJS.CpuUsage } | null = null

/**
 * Share of one core Memora used since the last measure, since boot for the first
 * @return {number} - Share, one for a whole core
 */

const readCpuShare = (): number => {
  const usage = process.cpuUsage()
  const at = performance.now()
  const since = lastCpu ?? { at: 0, usage: { user: 0, system: 0 } }
  lastCpu = { at, usage }

  const spentMicros = usage.user - since.usage.user + usage.system - since.usage.system
  const spentMs = spentMicros / MICROSECONDS_PER_MS
  const elapsedMs = at - since.at

  return elapsedMs > 0 ? spentMs / elapsedMs : 0
}

/**
 * Measure how Memora is doing right now
 * @return {Promise<HealthReport>} - Health report
 */

export const readHealthReport = async (): Promise<HealthReport> => {
  const memory = process.memoryUsage()
  const heap = v8.getHeapStatistics()
  const cores = os.cpus().length || 1

  const [available, sizes, connections, caches, tables, sessions, storage] = await Promise.all([
    readAvailableMemory(),
    prisma.$queryRaw<
      { bytes: number }[]
    >`SELECT pg_database_size(current_database())::float8 AS bytes`,
    prisma.$queryRaw<{ open: number; max: number }[]>`
      SELECT
        (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database())::int AS open,
        current_setting('max_connections')::int AS max`,
    prisma.$queryRaw<{ hit: number; read: number }[]>`
      SELECT blks_hit::float8 AS hit, blks_read::float8 AS read
      FROM pg_stat_database WHERE datname = current_database()`,
    prisma.$queryRaw<{ name: string; bytes: number; rows: number }[]>`
      SELECT relname AS name, pg_total_relation_size(relid)::float8 AS bytes, n_live_tup::float8 AS rows
      FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC LIMIT ${HEALTH_SETTINGS.shown}`,
    prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
    readStorageReport(),
  ])

  const reads = (caches[0]?.hit ?? 0) + (caches[0]?.read ?? 0)

  return {
    takenAt: new Date().toISOString(),
    memory: {
      rss: memory.rss,
      heapUsed: memory.heapUsed,
      heapLimit: heap.heap_size_limit,
      offHeap: memory.external + memory.arrayBuffers,
      hostFree: available,
      hostTotal: os.totalmem(),
    },
    processor: {
      cpu: readCpuShare(),
      loop: performance.eventLoopUtilization().utilization,
      load: os.loadavg()[0] / cores,
      uptimeSeconds: process.uptime(),
    },
    database: {
      bytes: sizes[0]?.bytes ?? 0,
      connections: connections[0]?.open ?? 0,
      maxConnections: connections[0]?.max ?? 0,
      cacheHit: reads > 0 ? (caches[0]?.hit ?? 0) / reads : null,
    },
    now: {
      sessions,
      readers: liveListenerCount(),
      sockets: realtimeSocketCount(),
      presence: presenceSeatCount(),
      docs: openDocCount(),
      files: storage.entries,
    },
    heaviest: {
      heap: v8
        .getHeapSpaceStatistics()
        .map((space) => ({ label: space.space_name, bytes: space.space_used_size }))
        .sort((left, right) => right.bytes - left.bytes)
        .slice(0, HEALTH_SETTINGS.shown),
      tables: tables.map((table) => ({ label: table.name, bytes: table.bytes, rows: table.rows })),
      buckets: [...storage.buckets]
        .sort((left, right) => right.bytes - left.bytes)
        .slice(0, HEALTH_SETTINGS.shown)
        .map((bucket) => ({ label: bucket.bucket, bytes: bucket.bytes, rows: bucket.entries })),
    },
  }
}
