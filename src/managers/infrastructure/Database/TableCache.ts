import 'server-only'

/**
 * Cache entry
 * @typedef {Object} CacheEntry
 * @property {unknown} value - Row value
 * @property {number} expiresAt - Expiry time
 */

interface CacheEntry {
  value: unknown
  expiresAt: number
}

/**
 * Table cache
 * @typedef {Object} TableCache
 * @property {string} table - Table name
 * @property {number} ttl - TTL seconds
 * @constructor
 */

export default class TableCache {
  /**
   * Table name
   * @type {string}
   */

  readonly table: string

  /**
   * Entry cache map
   * @type {Map<string, CacheEntry>}
   * @private
   */

  private readonly _entries = new Map<string, CacheEntry>()

  /**
   * Entry TTL
   * @type {number}
   * @private
   */

  private readonly _ttl: number

  /**
   * Cache hits
   * @type {number}
   * @private
   */

  private _hits = 0

  /**
   * Cache misses
   * @type {number}
   * @private
   */

  private _misses = 0

  /**
   * Create TableCache
   * @param {string} table - Table name
   * @param {number} ttl - TTL in seconds
   */

  constructor(table: string, ttl: number) {
    this.table = table
    this._ttl = ttl * 1000
  }

  /**
   * Get cache size
   * @return {number} - Entry count
   */

  get size(): number {
    return this._entries.size
  }

  /**
   * Get cache stats
   * @return {{ hits: number, misses: number }} - Stats
   */

  get stats(): { hits: number; misses: number } {
    return { hits: this._hits, misses: this._misses }
  }

  /**
   * Get cache entry
   * @template TValue - Value type
   * @param {string} id - Row ID
   * @return {TValue | null} - Value or null
   */

  get<TValue>(id: string): TValue | null {
    const entry = this._entries.get(id)

    if (!entry) {
      this._misses += 1

      return null
    }

    // Drop stale entry
    if (entry.expiresAt <= Date.now()) {
      this._entries.delete(id)
      this._misses += 1

      return null
    }

    this._hits += 1

    return entry.value as TValue
  }

  /**
   * Set cache entry
   * @param {string} id - Row ID
   * @param {unknown} value - Value
   * @return {void}
   */

  set(id: string, value: unknown): void {
    this._entries.set(id, { value, expiresAt: Date.now() + this._ttl })
  }

  /**
   * Delete entry
   * @param {string} id - Row ID
   * @return {void}
   */

  delete(id: string): void {
    this._entries.delete(id)
  }

  // Clear all entries
  clear(): void {
    this._entries.clear()
  }

  /**
   * Remember entry
   * @template TValue - Value type
   * @param {string} id - Row ID
   * @param {() => Promise<TValue>} load - Load function
   * @return {Promise<TValue>} - Cached value
   */

  async remember<TValue>(id: string, load: () => Promise<TValue>): Promise<TValue> {
    const cached = this.get<TValue>(id)

    if (cached !== null) return cached

    const value = await load()

    this.set(id, value)

    return value
  }

  // Prune stale entries
  prune(): void {
    const now = Date.now()

    this._entries.forEach((entry, id) => {
      if (entry.expiresAt <= now) this._entries.delete(id)
    })
  }
}
