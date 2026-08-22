import { createRegistry } from '@/core/lib/registry'

/**
 * Storage bucket metadata
 * @typedef {Object} StorageBucketOption
 * @property {string} label - Display name
 * @property {boolean} unique - One object per key
 */

interface StorageBucketOption {
  label: string
  unique: boolean
}

/**
 * Storage buckets
 * @type {Record<string, StorageBucketOption>}
 */

const STORAGE_BUCKET_MAP = {
  files: { label: 'Files', unique: false },
} satisfies Record<string, StorageBucketOption>

export const STORAGE_BUCKETS = createRegistry<keyof typeof STORAGE_BUCKET_MAP, StorageBucketOption>(
  STORAGE_BUCKET_MAP
)
