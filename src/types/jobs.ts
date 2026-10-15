import type { JOB_REGISTRY } from '@/declarations/system/jobs'

/**
 * Job name
 * @type {keyof typeof JOB_REGISTRY.map}
 */

export type JobName = keyof typeof JOB_REGISTRY.map

/**
 * Enqueue options
 * @typedef {Object} EnqueueJobOptions
 * @property {number} [attempts] - Retry count
 * @property {number} [delayMs] - Start delay
 * @property {string} [jobId] - Idempotency key
 */

export interface EnqueueJobOptions {
  attempts?: number
  delayMs?: number
  jobId?: string
}

/**
 * Running job context
 * @typedef {Object} JobContext
 * @property {string} id - Job ID
 * @property {Record<string, unknown>} payload - Job payload
 * @property {number} attempt - Attempt number
 */

export interface JobContext {
  id: string
  payload: Record<string, unknown>
  attempt: number
}

/**
 * Job handler
 * @typedef {Object} JobHandler
 * @property {JobName} queueName - Target queue
 * @property {(context: JobContext) => Promise<void>} process - Job body
 */

export interface JobHandler {
  queueName: JobName
  process: (context: JobContext) => Promise<void>
}

/**
 * Queue statistics
 * @typedef {Object} JobStats
 * @property {JobName} name - Queue name
 * @property {string} label - Display name
 * @property {number} waiting - Waiting jobs
 * @property {number} active - Active jobs
 * @property {number} completed - Completed jobs
 * @property {number} failed - Failed jobs
 * @property {number} delayed - Delayed jobs
 * @property {boolean} isPaused - Paused state
 * @property {boolean} hasWorker - Handler bound
 */

export interface JobStats {
  name: JobName
  label: string
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
  isPaused: boolean
  hasWorker: boolean
}

/**
 * One finished or running job
 * @typedef {Object} JobRun
 * @property {string} id - Job ID
 * @property {'completed' | 'failed' | 'active'} state - Outcome
 * @property {number} startedAt - Epoch ms
 * @property {number | null} finishedAt - Epoch ms
 * @property {number} attempts - Attempts made
 * @property {string | null} reason - Failure message
 */

export interface JobRun {
  id: string
  state: 'completed' | 'failed' | 'active'
  startedAt: number
  finishedAt: number | null
  attempts: number
  reason: string | null
}

/**
 * Queue detail
 * @typedef {Object} JobOverview
 * @property {JobRun[]} runs - Latest runs, newest first
 * @property {number | null} nextRun - Epoch ms of the next schedule
 */

export interface JobOverview {
  runs: JobRun[]
  nextRun: number | null
}
