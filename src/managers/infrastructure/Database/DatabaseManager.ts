import 'server-only'

import crypto from 'crypto'

import type { PrismaClient } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import type Sharding from '@/managers/infrastructure/Core/Sharding'
import type LoggerManager from '@/managers/infrastructure/Core/LoggerManager'
import TableCache from '@/managers/infrastructure/Database/TableCache'
import type { CachedTable } from '@/declarations/system/caches'
import type { DatabaseConfig } from '@/types/infrastructure'

/**
 * Mutation kinds
 * @type {readonly string[]}
 */

export const MUTATION_KINDS = ['insert', 'update', 'delete', 'clear'] as const

/**
 * Mutation kind
 * @type {(typeof MUTATION_KINDS)[number]}
 */

export type MutationKind = (typeof MUTATION_KINDS)[number]

/**
 * Mutation message
 * @typedef {Object} MutationMessage
 * @property {string} instance - Process ID
 * @property {string} table - Table name
 * @property {MutationKind} type - Mutation type
 * @property {string} [id] - Row ID
 */

export interface MutationMessage {
  instance: string
  table: string
  type: MutationKind
  id?: string
}

/**
 * Database manager
 * @typedef {Object} DatabaseManager
 * @property {Sharding} client - Client instance
 * @constructor
 */

export default class DatabaseManager {
  private readonly client: Sharding

  /**
   * Process instance ID
   * @type {string}
   */

  readonly instance = crypto.randomUUID()

  /**
   * Table caches map
   * @type {Map<string, TableCache>}
   * @private
   */

  private readonly _tables = new Map<string, TableCache>()

  /**
   * Sweep interval
   * @type {?ReturnType<typeof setInterval>}
   * @private
   */

  private _sweeper: ReturnType<typeof setInterval> | null = null

  /**
   * Create DatabaseManager
   * @param {Sharding} client - Client instance
   */

  constructor(client: Sharding) {
    this.client = client
  }

  /**
   * Get Prisma client
   * @return {PrismaClient} - Client
   */

  get connector(): PrismaClient {
    return prisma
  }

  /**
   * Get database config
   * @return {DatabaseConfig} - Config
   */

  get config(): DatabaseConfig {
    return this.client.config.get('database')
  }

  /**
   * Get logger instance
   * @return {LoggerManager} - Logger
   */

  get logger(): LoggerManager {
    return this.client.logger
  }

  /**
   * Get all table caches
   * @return {TableCache[]} - Caches
   */

  get tables(): TableCache[] {
    return Array.from(this._tables.values())
  }

  /**
   * Get table cache
   * @param {CachedTable} table - Table name
   * @return {TableCache} - Cache
   */

  get(table: CachedTable): TableCache {
    const existing = this._tables.get(table)

    if (existing) return existing

    const created = new TableCache(table, this.config.ttl)

    this._tables.set(table, created)

    return created
  }

  /**
   * Ping database
   * @return {Promise<void>} - Completion
   */

  async ping(): Promise<void> {
    await this.connector.$queryRaw`SELECT 1`
  }

  /**
   * Load database
   * @return {Promise<void>} - Completion
   */

  async load(): Promise<void> {
    const config = this.config

    if (!config.enabled) return

    // Test connectivity
    await this.ping()

    // Start cache sweeper
    this._sweeper = setInterval(
      () => this._tables.forEach((cache) => cache.prune()),
      Math.max(config.ttl, 1) * 1000
    )

    this._sweeper.unref?.()

    // Setup synchronization
    if (config.synchronize.status) {
      if (!this.client.config.isEnabled('redis')) {
        this.logger.warn(
          'Cache sync requested without Redis, each instance will have its own cache'
        )
      } else {
        await this.client.redis.subscribe(config.synchronize.event)

        this.logger.info(`Cache sync enabled on channel ${config.synchronize.event}`)
      }
    }

    this.logger.info('Database ready')
  }

  /**
   * Announce mutation
   * @param {CachedTable} table - Table name
   * @param {MutationKind} type - Mutation type
   * @param {string} [id] - Row ID
   * @return {Promise<void>} - Completion
   */

  async announce(table: CachedTable, type: MutationKind, id?: string): Promise<void> {
    // Update local cache
    this._apply(table, type, id)

    const config = this.config

    if (!config.synchronize.status || !this.client.redis.isReady()) return

    const message: MutationMessage = { instance: this.instance, table, type, ...(id ? { id } : {}) }

    try {
      await this.client.redis.publish(config.synchronize.event, message)
    } catch (error) {
      // Log failure but don't break write
      this.logger.warn('Failed to publish mutation', {
        table,
        reason: error instanceof Error ? error.message : error,
      })
    }
  }

  /**
   * Listen to mutations
   * @param {MutationMessage} data - Message data
   * @return {void} - Completion
   */

  listener(data: MutationMessage): void {
    // Ignore own messages
    if (!data || data.instance === this.instance) return

    // Ignore uncached tables
    if (!this._tables.has(data.table)) return

    this._apply(data.table, data.type, data.id)
  }

  /**
   * Apply mutation locally
   * @param {string} table - Table name
   * @param {MutationKind} type - Mutation type
   * @param {string} [id] - Row ID
   * @return {void} - Completion
   * @private
   */

  private _apply(table: string, type: MutationKind, id?: string): void {
    const cache = this._tables.get(table)

    if (!cache) return

    // Bulk clear or partial delete
    if (type === 'clear' || !id) cache.clear()
    else cache.delete(id)
  }

  /**
   * Close database
   * @return {Promise<void>} - Completion
   */

  async close(): Promise<void> {
    if (this._sweeper) {
      clearInterval(this._sweeper)
      this._sweeper = null
    }

    this._tables.forEach((cache) => cache.clear())
    this._tables.clear()
  }
}
