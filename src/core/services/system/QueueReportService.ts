import 'server-only'

import { systemFailure } from '@/core/lib/errors'
import { recordEvent } from '@/core/services/system/ActivityService'
import { JOB_REGISTRY } from '@/declarations/system/jobs'
import { runtime } from '@/managers/infrastructure/Core/runtime'
import type { JobName, JobOverview, JobStats } from '@/types/jobs'

// Runs kept per job
const RUNS_SHOWN = 8

/**
 * One job as the queue lives it
 * @typedef {Object} JobReport
 * @property {JobName} name - Job key
 * @property {string} label - Display name
 * @property {string | null} schedule - Cron pattern
 * @property {JobStats | null} stats - Queue counters
 * @property {JobOverview} overview - Runs and next schedule
 */

export interface JobReport {
  name: JobName
  label: string
  schedule: string | null
  stats: JobStats | null
  overview: JobOverview
}

/**
 * Queue report
 * @typedef {Object} QueueReport
 * @property {boolean} running - Queues are open
 * @property {JobReport[]} jobs - One per declared job
 */

export interface QueueReport {
  running: boolean
  jobs: JobReport[]
}

/**
 * Read every job and its runs
 * @return {Promise<QueueReport>} - Queue report
 */

export const readQueueReport = async (): Promise<QueueReport> => {
  const queues = runtime()?.queues
  const running = queues?.isReady() ?? false
  const stats = running ? await queues!.getStats() : []

  const jobs = await Promise.all(
    JOB_REGISTRY.keys.map(async (name) => ({
      name,
      label: JOB_REGISTRY.label(name),
      schedule: JOB_REGISTRY.get(name).schedule ?? null,
      stats: stats.find((entry) => entry.name === name) ?? null,
      overview: running ? await queues!.getOverview(name, RUNS_SHOWN) : { runs: [], nextRun: null },
    }))
  )

  return { running, jobs }
}

/**
 * Retry the failed runs of one job
 * @param {JobName} name - Job key
 * @param {string} actorId - Admin who asked
 * @return {Promise<void>} - Retried
 */

export const retryFailedJobs = async (name: JobName, actorId: string): Promise<void> => {
  const queues = runtime()?.queues
  if (!queues || !(await queues.retryFailed(name))) throw systemFailure()

  await recordEvent({
    eventType: 'JobRetried',
    actorId,
    summary: JOB_REGISTRY.label(name),
  })
}
