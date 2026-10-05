import { createRegistry } from '@/core/lib/registry'

/**
 * Job metadata
 * @typedef {Object} JobOption
 * @property {string} label - Display name
 * @property {number} [attempts] - Retry override
 * @property {number} [concurrency] - Worker override
 * @property {string} [schedule] - Cron pattern of a recurring job
 */

interface JobOption {
  label: string
  attempts?: number
  concurrency?: number
  schedule?: string
}

/**
 * Declared jobs
 * @type {Record<string, JobOption>}
 */

const JOB_MAP = {
  // Retention runs nightly
  maintenance: { label: 'Maintenance', schedule: '17 4 * * *' },
  // Roll-call reminders are due to the minute
  reminders: { label: 'Rappels de présence', schedule: '*/5 * * * *' },
} satisfies Record<string, JobOption>

export const JOB_REGISTRY = createRegistry<keyof typeof JOB_MAP, JobOption>(JOB_MAP)
