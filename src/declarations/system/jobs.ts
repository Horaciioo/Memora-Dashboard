import { createRegistry } from '@/core/lib/registry'

/**
 * Job metadata
 * @typedef {Object} JobOption
 * @property {string} label - Display name
 * @property {number} [attempts] - Retry override
 * @property {number} [concurrency] - Worker override
 */

interface JobOption {
  label: string
  attempts?: number
  concurrency?: number
}

/**
 * Declared jobs
 * @type {Record<string, JobOption>}
 */

const JOB_MAP = {
  maintenance: { label: 'Maintenance' },
} satisfies Record<string, JobOption>

export const JOB_REGISTRY = createRegistry<keyof typeof JOB_MAP, JobOption>(JOB_MAP)
