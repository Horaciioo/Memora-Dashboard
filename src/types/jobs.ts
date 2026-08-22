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
 * @property {string} [repeatCron] - Cron pattern
 */

export interface EnqueueJobOptions {
  attempts?: number
  delayMs?: number
  jobId?: string
  repeatCron?: string
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
