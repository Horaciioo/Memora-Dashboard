import type { STORAGE_BUCKETS } from '@/declarations/system/storage'

/**
 * Storage bucket
 * @type {keyof typeof STORAGE_BUCKETS.map}
 */

export type StorageBucket = keyof typeof STORAGE_BUCKETS.map

/**
 * Object location
 * @typedef {Object} StorageLocation
 * @property {StorageBucket} bucket - Declared bucket
 * @property {string} key - Object key
 */

export interface StorageLocation {
  bucket: StorageBucket
  key: string
}

/**
 * Object write
 * @typedef {Object} StorageWrite
 * @property {Uint8Array<ArrayBuffer>} data - Raw bytes
 * @property {string} [mimeType] - Forced type
 * @property {number} [maxBytes] - Caller ceiling
 * @property {string[]} [allowedTypes] - Caller filter
 * @property {Record<string, string>} [metadata] - Extra fields
 */

export interface StorageWrite {
  data: Uint8Array<ArrayBuffer>
  mimeType?: string
  maxBytes?: number
  allowedTypes?: string[]
  metadata?: Record<string, string>
}

/**
 * Object metadata
 * @typedef {Object} StorageInfo
 * @property {StorageBucket} bucket - Declared bucket
 * @property {string} key - Object key
 * @property {string} mimeType - Detected type
 * @property {number} byteSize - Byte length
 * @property {Date} updatedAt - Last write
 */

export interface StorageInfo {
  bucket: StorageBucket
  key: string
  mimeType: string
  byteSize: number
  updatedAt: Date
}

/**
 * Object payload
 * @typedef {Object} StorageObject
 * @property {Uint8Array<ArrayBuffer>} data - Raw bytes
 * @property {string} mimeType - Detected type
 * @property {Date} updatedAt - Last write
 */

export interface StorageObject {
  data: Uint8Array<ArrayBuffer>
  mimeType: string
  updatedAt: Date
}
