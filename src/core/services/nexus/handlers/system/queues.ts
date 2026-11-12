import 'server-only'

import { conflict } from '@/core/lib/errors'
import { redactRecord } from '@/core/lib/nexus/redact'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { readQueueReport, retryFailedJobs } from '@/core/services/system/QueueReportService'
import { SYSTEM_COPY } from '@/declarations/nexus/modulesCopy'
import { NEXUS_SYSTEM } from '@/declarations/nexus/modulesSettings'
import { JOB_REGISTRY } from '@/declarations/system/jobs'
import { runtime } from '@/managers/infrastructure/Core/runtime'
import type { JobName } from '@/types/jobs'

// Queue named by an argument
const queueOf = (raw: unknown): JobName => {
  const name = JOB_REGISTRY.keys.find((key) => key === String(raw))
  if (!name) throw conflict(SYSTEM_COPY.unknownQueue)

  return name
}

const status: NexusHandler = async () => {
  const report = await readQueueReport()

  return {
    output: report.jobs.map((job) => ({
      queue: job.name,
      label: job.label,
      schedule: job.schedule,
      waiting: job.stats?.waiting ?? null,
      active: job.stats?.active ?? null,
      failed: job.stats?.failed ?? null,
      delayed: job.stats?.delayed ?? null,
      next: job.overview.nextRun,
    })),
    level: report.running ? 'success' : 'warning',
  }
}

const inspect: NexusHandler = async (context) => {
  const queue = runtime()?.queues.get(queueOf(context.args.queue))
  if (!queue) throw conflict(SYSTEM_COPY.unknownQueue)

  const state = String(context.args.state ?? 'failed') as
    'failed' | 'waiting' | 'active' | 'delayed'
  const jobs = await queue.getJobs([state], 0, NEXUS_SYSTEM.queueRows - 1)

  return {
    output: jobs.map((job) =>
      redactRecord({
        id: job.id,
        name: job.name,
        attempts: job.attemptsMade,
        error: job.failedReason ?? null,
        data: job.data,
        at: new Date(job.timestamp).toISOString(),
      })
    ),
  }
}

const retry: NexusHandler = async (context) => {
  const name = queueOf(context.args.queue)
  if (context.dryRun) return { output: { queue: name, action: 'relancer les échecs' } }

  await retryFailedJobs(name, context.accountId)

  return { output: { queue: name, action: 'échecs relancés' }, target: `queue:${name}` }
}

// Pause or resume one queue
const toggle =
  (pause: boolean): NexusHandler =>
  async (context) => {
    const name = queueOf(context.args.queue)
    const queue = runtime()?.queues.get(name)
    if (!queue) throw conflict(SYSTEM_COPY.unknownQueue)
    const action = pause ? 'mise en pause' : 'reprise'
    if (context.dryRun) return { output: { queue: name, action }, level: 'warning' }

    await (pause ? queue.pause() : queue.resume())

    return { output: { queue: name, action }, target: `queue:${name}`, level: 'warning' }
  }

const run: NexusHandler = async (context) => {
  if (String(context.args.queue) !== 'maintenance')
    throw conflict('Seule la file maintenance se lance à la main')
  if (context.dryRun) return { output: { queue: 'maintenance', action: 'lancer un passage' } }

  const id = await runtime()?.queues.enqueue('maintenance')
  if (!id) throw conflict(SYSTEM_COPY.unknownQueue)

  return { output: { queue: 'maintenance', job: id }, target: 'queue:maintenance' }
}

/**
 * Queues of the system module
 * @type {Record<string, NexusHandler>}
 */

export const QUEUE_HANDLERS: Record<string, NexusHandler> = {
  'system.queueStatus': status,
  'system.queueInspect': inspect,
  'system.queueRetry': retry,
  'system.queuePause': toggle(true),
  'system.queueResume': toggle(false),
  'system.queueRun': run,
}
