/**
 * Cached tables
 * @type {readonly string[]}
 */

export const CACHED_TABLES = ['storageEntry'] as const

/**
 * Cached table
 * @type {(typeof CACHED_TABLES)[number]}
 */

export type CachedTable = (typeof CACHED_TABLES)[number]
