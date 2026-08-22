import 'server-only'

import { EventEmitter } from 'events'

import RedisClient from 'ioredis'
import type { Redis, RedisOptions } from 'ioredis'

import type Sharding from '@/managers/infrastructure/Core/Sharding'
import type LoggerManager from '@/managers/infrastructure/Core/LoggerManager'
import type { RedisConfig } from '@/types/infrastructure'

/**
 * Scan options
 * @typedef {Object} FindKeysOptions
 * @property {number} [count] - Keys per batch
 * @property {number} [limit] - Max keys to return
 */

export interface FindKeysOptions {
  count?: number
  limit?: number
}

/**
 * Redis manager
 * @typedef {Object} RedisManager
 * @property {Sharding} client - Client instance
 * @constructor
 */

export default class RedisManager extends EventEmitter {
  private readonly client: Sharding

  /**
   * Setter client
   * @type {?Redis}
   * @private
   */

  private redisSetter: Redis | null = null

  /**
   * Publisher client
   * @type {?Redis}
   * @private
   */

  private redisPublisher: Redis | null = null

  /**
   * Subscriber client
   * @type {?Redis}
   * @private
   */

  private redisSubscriber: Redis | null = null

  /**
   * Connection options
   * @type {?RedisOptions}
   * @private
   */

  private _connectionOptions: RedisOptions | null = null

  /**
   * Create RedisManager
   * @param {Sharding} client - Client instance
   */

  constructor(client: Sharding) {
    super()

    this.client = client
  }

  /**
   * Get cache client
   * @return {Redis | null} - Setter client
   */

  get cache(): Redis | null {
    return this.redisSetter
  }

  /**
   * Get Redis config
   * @return {RedisConfig} - Config
   */

  get config(): RedisConfig {
    return this.client.config.get('redis')
  }

  /**
   * Get logger instance
   * @return {LoggerManager} - Logger
   */

  get logger(): LoggerManager {
    return this.client.logger
  }

  /**
   * Get key prefix
   * @return {string} - Prefix
   */

  get prefix(): string {
    return this.config.prefix || ''
  }

  /**
   * Check if ready
   * @return {boolean} - Ready status
   */

  isReady(): boolean {
    return this.redisSetter?.status === 'ready'
  }

  /**
   * Get connection options
   * @return {RedisOptions} - Options
   * @private
   */

  private _getConnectionOptions(): RedisOptions {
    // Reuse cached options
    if (this._connectionOptions) return this._connectionOptions

    const { connection, db, password } = this.config

    this._connectionOptions = {
      db,
      ...(password ? { password } : {}),
      reconnectOnError: (error: Error) =>
        !(error.message.includes('NOAUTH') || error.message.includes('ERR')),
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy: (times: number) =>
        connection.retryStrategy === 'fixed'
          ? connection.retryBackoffMs
          : Math.min(times * connection.retryBackoffMs, connection.retryMaxDelayMs),
      maxRetriesPerRequest: connection.maxRetries,
      commandTimeout: connection.commandTimeoutMs,
    }

    return this._connectionOptions
  }

  /**
   * Create client
   * @param {string} [purpose] - Purpose
   * @return {Promise<Redis>} - Client
   * @private
   */

  private async _createClient(purpose = 'generic'): Promise<Redis> {
    const { url, host, port, connection } = this.config

    // URL takes precedence
    const created = url
      ? new RedisClient(url, this._getConnectionOptions())
      : new RedisClient(port, host, this._getConnectionOptions())

    // Wait for ready
    return new Promise((resolve, reject) => {
      // Connection timeout
      const timeout = setTimeout(() => {
        reject(new Error(`Redis client ${purpose} connection timeout`))
      }, connection.readyTimeoutMs)

      // Settle ready/error race
      const onEvent = (error?: Error): void => {
        clearTimeout(timeout)

        created.removeListener('error', onEvent)
        created.removeListener('ready', onEvent)

        if (error) {
          this.logger.error(`Redis client ${purpose} failed`, error)

          reject(error)

          return
        }

        resolve(created)
      }

      created.once('error', onEvent)
      created.once('ready', onEvent)

      created.connect().catch((error: Error) => onEvent(error))
    })
  }

  /**
   * Connect to Redis
   * @return {Promise<RedisManager>} - This
   */

  async connect(): Promise<RedisManager> {
    try {
      // Create setter
      this.redisSetter = await this._createClient('setter')

      // Start heartbeat
      this._setupHeartbeat(this.redisSetter)

      return this
    } catch (error) {
      this.logger.error('Redis connection failed', error)

      throw error
    }
  }

  /**
   * Load Redis
   * @return {Promise<void>} - Completion
   */

  async load(): Promise<void> {
    if (!this.config.enabled) return

    await this.connect()

    this.logger.info(
      `Redis ready at ${this.config.url ?? `${this.config.host}:${this.config.port}`}`
    )
  }

  /**
   * Setup heartbeat
   * @param {Redis} client - Client
   * @return {void}
   * @private
   */

  private _setupHeartbeat(client: Redis): void {
    // Ping to prevent timeout
    const interval = setInterval(() => {
      if (client.status === 'ready') {
        client.ping().catch((error: Error) => {
          this.logger.warn('Redis heartbeat failed', { reason: error.message })
        })
      }
    }, this.config.connection.heartbeatMs)

    // Don't hold process
    interval.unref?.()

    // Cleanup on close
    client.once('end', () => clearInterval(interval))
  }

  /**
   * Init listener
   * @return {void}
   * @private
   */

  private _initListener(): void {
    // Skip if no subscriber
    if (!this.redisSubscriber) return

    // Remove duplicates
    this.redisSubscriber.removeAllListeners('message')

    // Listen for messages
    this.redisSubscriber.on('message', (channel: string, message: string) => {
      try {
        // Emit message event
        this.emit('message', channel, message)

        const synchronize = this.client.database.config.synchronize

        // Handle sync if enabled
        if (synchronize.status && channel === synchronize.event) {
          this.client.database.listener(JSON.parse(message))
        }
      } catch (error) {
        this.logger.error('Redis message parse failed', error)
      }
    })

    // Handle reconnect
    this.redisSubscriber.on('reconnecting', () => {
      this.logger.warn('Redis subscriber reconnecting')
    })
  }

  /**
   * Subscribe to channel
   * @param {string} channel - Channel
   * @return {Promise<void>} - Completion
   */

  async subscribe(channel: string): Promise<void> {
    // Require channel name
    if (!channel) throw new Error('Channel name required')

    try {
      // Create subscriber if needed
      if (!this.redisSubscriber) {
        this.redisSubscriber = await this._createClient('subscriber')

        this._initListener()
      }

      // Subscribe
      await this.redisSubscriber.subscribe(channel)

      this.logger.debug(`Subscribed to Redis channel ${channel}`)
    } catch (error) {
      this.logger.error(`Subscribe to channel ${channel} failed`, error)

      throw error
    }
  }

  /**
   * Publish message
   * @param {string} channel - Channel
   * @param {string | object} message - Message
   * @return {Promise<number>} - Subscribers reached
   */

  async publish(channel: string, message: string | object): Promise<number> {
    if (!channel) throw new Error('Channel name required')

    try {
      // Stringify if needed
      const payload = typeof message === 'object' ? JSON.stringify(message) : String(message)

      // Create publisher if needed
      if (!this.redisPublisher) this.redisPublisher = await this._createClient('publisher')

      // Publish
      const recipients = await this.redisPublisher.publish(channel, payload)

      this.logger.debug(`Published to ${channel}, reached ${recipients} clients`)

      return recipients
    } catch (error) {
      this.logger.error(`Publish to channel ${channel} failed`, error)

      throw error
    }
  }

  /**
   * Ping server
   * @return {Promise<string>} - Reply
   */

  async ping(): Promise<string> {
    if (!this.cache) throw new Error('Redis cache not initialized, call connect() first')

    return this.cache.ping()
  }

  /**
   * Find keys by pattern
   * @param {string} match - Pattern
   * @param {FindKeysOptions} [options] - Options
   * @return {Promise<string[]>} - Keys
   */

  async findKeys(match: string, options: FindKeysOptions = {}): Promise<string[]> {
    // Require initialized cache
    if (!this.cache) throw new Error('Redis cache not initialized, call connect() first')

    // Set defaults
    const count = options.count || this.config.scan.count
    const limit = options.limit || 0

    // Create scan stream
    const stream = this.cache.scanStream({ match, count })

    // Collect keys
    const keys: string[] = []

    try {
      await new Promise<void>((resolve, reject) => {
        // Handle errors
        stream.on('error', (error: Error) => {
          this.logger.error('Redis scan error', error)

          reject(error)
        })

        // Signal end
        stream.on('end', () => resolve())

        // Process batches
        stream.on('data', (batch: string[]) => {
          // Skip empty
          if (!batch.length) return

          keys.push(...batch)

          // Stop at limit
          if (limit > 0 && keys.length >= limit) {
            stream.destroy()

            resolve()
          }
        })
      })

      // Return limited keys
      return limit > 0 ? keys.slice(0, limit) : keys
    } catch (error) {
      this.logger.error(`Find keys ${match} failed`, error)

      throw error
    }
  }

  /**
   * Disconnect all
   * @return {Promise<void>} - Completion
   */

  async disconnect(): Promise<void> {
    // Close clients
    const clients = [this.redisSetter, this.redisPublisher, this.redisSubscriber].filter(
      (entry): entry is Redis => entry !== null
    )

    // Disconnect all
    await Promise.all(
      clients.map(async (entry) => {
        try {
          await entry.quit()
        } catch (error) {
          this.logger.warn('Redis client close failed', {
            reason: error instanceof Error ? error.message : error,
          })
        }
      })
    )

    // Clear references
    this.redisSetter = null
    this.redisPublisher = null
    this.redisSubscriber = null
    this._connectionOptions = null
  }
}
