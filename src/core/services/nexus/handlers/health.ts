import 'server-only'

import { monitorEventLoopDelay } from 'node:perf_hooks'

import pkg from '@/../package.json'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { realtimeSocketCount } from '@/core/lib/realtime/server'
import { OBSERVABILITY } from '@/core/lib/nexus/observe/registry'
import { listFeatureRows } from '@/core/services/features'
import { readHealthReport } from '@/core/services/system/HealthService'
import { readRuntimeReport } from '@/core/services/system/ConsoleService'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { FEATURE_MAP, FEATURES } from '@/declarations/features'
import { isNexusConfigured } from '@/declarations/nexus/owner'
import { NEXUS_OBSERVABILITY } from '@/declarations/nexus/observability'
import { BACKGROUND_SERVICES, SERVICE_INVENTORY } from '@/declarations/nexus/inventory'

// Event loop delay sampled since the process started
const loop = monitorEventLoopDelay({ resolution: 20 })
loop.enable()

// Window asked for, default the shortest
const windowOf = (value: unknown): number =>
  NEXUS_OBSERVABILITY.windowsMinutes.includes(Number(value))
    ? Number(value)
    : NEXUS_OBSERVABILITY.windowsMinutes[0]

const health: NexusHandler = async () => {
  const [report, extras] = await Promise.all([
    readHealthReport(),
    Promise.resolve(readRuntimeReport()),
  ])

  return {
    output: {
      ...report,
      environment: extras.environment,
      started: extras.started,
      nexus: { configured: isNexusConfigured() },
      subjects: extras.subjects.map((subject) => ({
        subject: subject.subject,
        enabled: subject.enabled,
        required: subject.required,
        status: subject.probe?.status ?? null,
      })),
    },
    level: extras.started ? 'success' : 'warning',
  }
}

const metrics: NexusHandler = async ({ args }) => {
  const minutes = windowOf(args.window)
  const memory = process.memoryUsage()

  return {
    output: {
      windowMinutes: minutes,
      memoryRssMb: Math.round(memory.rss / 1048576),
      heapUsedMb: Math.round(memory.heapUsed / 1048576),
      eventLoopP99Ms: Math.round(loop.percentile(99) / 1e6),
      sockets: realtimeSocketCount(),
      requests: Object.values(OBSERVABILITY.http.read(minutes)).reduce(
        (sum, row) => sum + row.count,
        0
      ),
      queries: Object.values(OBSERVABILITY.prisma.read(minutes)).reduce(
        (sum, row) => sum + row.count,
        0
      ),
      messages: Object.values(OBSERVABILITY.websocket.read(minutes)).reduce(
        (sum, row) => sum + row.count,
        0
      ),
      jobs: Object.values(OBSERVABILITY.jobs.read(minutes)).reduce(
        (sum, row) => sum + row.count,
        0
      ),
    },
  }
}

// Rows of one series, busiest first
const rowsOf = (series: Record<string, unknown>, filter: string | undefined, limit = 50) =>
  Object.entries(
    series as Record<string, { count: number; errors: number; p50: number; p95: number }>
  )
    .filter(([key]) => !filter || key.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => b[1].p95 - a[1].p95)
    .slice(0, limit)
    .map(([key, figures]) => ({
      key,
      ...figures,
      p50: Math.round(figures.p50),
      p95: Math.round(figures.p95),
    }))

const performance: NexusHandler = async ({ args }) => {
  const minutes = windowOf(args.window)
  const route = args.route ? String(args.route) : undefined
  const model = args.model ? String(args.model) : undefined

  return {
    output: model
      ? rowsOf(OBSERVABILITY.prisma.read(minutes), model)
      : rowsOf(OBSERVABILITY.http.read(minutes), route),
  }
}

const services: NexusHandler = async () => {
  const runtime = readRuntimeReport()

  return {
    output: [
      ...Object.entries(SERVICE_INVENTORY).map(([name, entry]) => {
        const subject = runtime.subjects.find((candidate) => candidate.subject === name)

        return {
          service: name,
          enabled: subject?.enabled ?? false,
          status: subject?.probe?.status ?? null,
          restartable: entry.restartable,
          dependsOn: entry.dependsOn.join(', '),
        }
      }),
      ...BACKGROUND_SERVICES.map((name) => ({
        service: name,
        enabled: true,
        status: null,
        restartable: true,
        dependsOn: '',
      })),
    ],
  }
}

const dependencies: NexusHandler = async () => {
  const [{ version }] = await prisma.$queryRaw<{ version: string }[]>`SELECT version()`

  return {
    output: {
      node: process.version,
      postgres: version.split(' ').slice(0, 2).join(' '),
      next: pkg.dependencies.next,
      prisma: pkg.dependencies['@prisma/client'],
      react: pkg.dependencies.react,
      packages: { ...pkg.dependencies, ...pkg.devDependencies },
    },
  }
}

const features: NexusHandler = async () => {
  const rows = await listFeatureRows()

  return {
    output: rows.map((row) => ({
      key: row.key,
      mode: row.mode,
      own: row.own,
      source: row.source,
      note: row.note,
      paused: row.isPaused,
    })),
  }
}

const feature: NexusHandler = async ({ args }) => {
  const key = String(args.key)
  const definition = FEATURE_MAP.get(key)
  if (!definition) throw notFound()

  const row = (await listFeatureRows()).find((candidate) => candidate.key === key)
  const children = FEATURES.filter((candidate) => candidate.parent === key).map((c) => c.key)
  const recent = await prisma.errorEvent.findMany({
    where: { route: { contains: key.split('.')[0], mode: 'insensitive' } },
    orderBy: { lastAt: 'desc' },
    take: 10,
  })

  return {
    output: {
      key,
      label: definition.label,
      description: definition.description,
      kind: definition.kind,
      parent: definition.parent ?? null,
      children: children.join(', '),
      mode: row?.mode ?? null,
      source: row?.source ?? null,
      pages: (definition.routes ?? []).join(', '),
      api: (definition.api ?? []).join(', '),
      recentErrors: recent.map((event) => `${event.severity} ${event.message}`).join('\n'),
    },
  }
}

/**
 * Handlers of health, metrics and features
 * @type {Record<string, NexusHandler>}
 */

export const HEALTH_HANDLERS: Record<string, NexusHandler> = {
  'memora.health': health,
  'memora.metrics': metrics,
  'memora.performance': performance,
  'memora.services': services,
  'memora.dependencies': dependencies,
  'memora.features': features,
  'memora.feature': feature,
}
