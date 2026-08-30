import 'server-only'

import { Queue, Worker } from 'bullmq'
import type { Job } from 'bullmq'
import RedisClient from 'ioredis'
import type { Redis } from 'ioredis'

import type Sharding from '@/managers/infrastructure/Core/Sharding'
import type LoggerManager from '@/managers/infrastructure/Core/LoggerManager'
import { JOB_REGISTRY } from '@/declarations/system/jobs'
import type { QueuesConfig } from '@/types/infrastructure'
import type { EnqueueJobOptions, JobHandler, JobName, JobStats } from '@/types/jobs'

/**
 * Queue manager
 * @typedef {Object} QueueManager
 * @property {Sharding} client - Client instance
 * @constructor
 */

export default class QueueManager {
  private readonly client: Sharding

  /**
   * Queues map
   * @type {Map<JobName, Queue>}
   * @private
   */

  private readonly _queues = new Map<JobName, Queue>()

  /**
   * Workers map
   * @type {Map<JobName, Worker>}
   * @private
   */

  private readonly _workers = new Map<JobName, Worker>()

  /**
   * Handlers map
   * @type {Map<JobName, JobHandler>}
   * @private
   */

  private readonly _handlers = new Map<JobName, JobHandler>()

  /**
   * Engine connection
   * @type {?Redis}
   * @private
   */

  private _connection: Redis | null = null

  /**
   * Loaded state
   * @type {boolean}
   * @private
   */

  private _loaded = false

  /**
   * Create QueueManager
   * @param {Sharding} client - Client instance
   */

  constructor(client: Sharding) {
    this.client = client
  }

  /**
   * Get queues config
   * @return {QueuesConfig} - Config
   */

  get config(): QueuesConfig {
    return this.client.config.get('queues')
  }

  /**
   * Get logger instance
   * @return {LoggerManager} - Logger
   */

  get logger(): LoggerManager {
    return this.client.logger
  }

  /**
   * Check if ready
   * @return {boolean} - Ready status
   */

  isReady(): boolean {
    return this._loaded
  }

  /**
   * Register handler
   * @param {JobHandler} handler - Handler
   * @return {void}
   */

  register(handler: JobHandler): void {
    if (this._handlers.has(handler.queueName)) {
      this.logger.warn(`Queue ${handler.queueName} already has handler, duplicate ignored`)

      return
    }

    this._handlers.set(handler.queueName, handler)

    // Start worker if loaded
    if (this._loaded) this._startWorker(handler)
  }

  /**
   * Get queue
   * @param {JobName} name - Queue name
   * @return {Queue | null} - Queue or null
   */

  get(name: JobName): Queue | null {
    return this._queues.get(name) ?? null
  }

  /**
   * Enqueue job
   * @param {JobName} name - Queue name
   * @param {Record<string, unknown>} [payload] - Payload
   * @param {EnqueueJobOptions} [options] - Options
   * @return {Promise<string | null>} - Job ID
   */

  async enqueue(
    name: JobName,
    payload: Record<string, unknown> = {},
    options: EnqueueJobOptions = {}
  ): Promise<string | null> {
    const queue = this.get(name)

    // Queue unavailable
    if (!queue) {
      this.logger.debug(`Queue ${name} unavailable, job ignored`)

      return null
    }

    const meta = JOB_REGISTRY.get(name)

    const job = await queue.add(name, payload, {
      attempts: options.attempts ?? meta.attempts ?? this.config.attempts,
      ...(options.delayMs ? { delay: options.delayMs } : {}),
      ...(options.jobId ? { jobId: options.jobId } : {}),
    })

    return job.id ?? null
  }

  /**
   * Keep one recurring job on its cron. BullMQ 6 drives repeats through a job
   * scheduler, a repeat flag on add() no longer registers anything
   * @param {JobName} name - Queue name
   * @param {string} pattern - Cron pattern
   * @return {Promise<boolean>} - Schedule is in place
   */

  async schedule(name: JobName, pattern: string): Promise<boolean> {
    const queue = this.get(name)

    // Queue unavailable
    if (!queue) {
      this.logger.debug(`Queue ${name} unavailable, schedule ignored`)

      return false
    }

    const meta = JOB_REGISTRY.get(name)

    await queue.upsertJobScheduler(
      name,
      { pattern },
      { opts: { attempts: meta.attempts ?? this.config.attempts } }
    )

    return true
  }

  /**
   * Load queues
   * @return {Promise<void>} - Completion
   */

  async load(): Promise<void> {
    // Skip if already loaded
    if (this._loaded) {
      this.logger.debug('Queues already loaded, skipping')

      return
    }

    const config = this.config

    if (!config.enabled) return

    if (!this.client.config.isEnabled('redis')) {
      this.logger.warn('Queues enabled without Redis, no queues starting')

      return
    }

    try {
      this._connection = this._createConnection()

      // Create queue for each name
      JOB_REGISTRY.keys.forEach((name) => {
        this._queues.set(
          name,
          new Queue(name, {
            connection: this._connection as Redis,
            prefix: config.prefix,
            defaultJobOptions: {
              attempts: config.attempts,
              backoff: { type: config.backoff.type, delay: config.backoff.delayMs },
              removeOnComplete: config.removeOnComplete,
              removeOnFail: config.removeOnFail,
            },
          })
        )
      })

      this._handlers.forEach((handler) => this._startWorker(handler))

      this._loaded = true

      // Warn about orphaned queues
      const orphans = JOB_REGISTRY.keys.filter((name) => !this._handlers.has(name))

      if (orphans.length > 0) {
        this.logger.warn(`Queues without handler: ${orphans.join(', ')}`)
      }

      this.logger.info(`${this._queues.size} queues loaded, ${this._workers.size} listening`)
    } catch (error) {
      this.logger.error('Queue load failed', error)
    }
  }

  /**
   * Pause all queues
   * @return {Promise<void>} - Completion
   */

  async pauseAll(): Promise<void> {
    await Promise.all(
      Array.from(this._queues.entries()).map(([name, queue]) =>
        queue.pause().catch((error: Error) => {
          this.logger.error(`Pause queue ${name} failed`, error)
        })
      )
    )

    this.logger.info(`${this._queues.size} queues paused`)
  }

  /**
   * Resume all queues
   * @return {Promise<void>} - Completion
   */

  async resumeAll(): Promise<void> {
    await Promise.all(
      Array.from(this._queues.entries()).map(([name, queue]) =>
        queue.resume().catch((error: Error) => {
          this.logger.error(`Resume queue ${name} failed`, error)
        })
      )
    )

    this.logger.info(`${this._queues.size} queues resumed`)
  }

  /**
   * Get queue stats
   * @return {Promise<JobStats[]>} - Stats
   */

  async getStats(): Promise<JobStats[]> {
    return Promise.all(JOB_REGISTRY.keys.map((name) => this._statsOf(name)))
  }

  /**
   * Close all queues
   * @return {Promise<void>} - Completion
   */

  async closeAll(): Promise<void> {
    // Skip if not loaded
    if (!this._loaded) return

    // Close workers first
    await Promise.all(
      Array.from(this._workers.values()).map((worker) => worker.close().catch(() => undefined))
    )

    await Promise.all(
      Array.from(this._queues.values()).map((queue) => queue.close().catch(() => undefined))
    )

    this._workers.clear()
    this._queues.clear()

    await this._connection?.quit().catch(() => undefined)
    this._connection = null

    this._loaded = false

    this.logger.info('All queues closed')
  }

  /**
   * Create connection
   * @return {Redis} - Connection
   * @private
   */

  private _createConnection(): Redis {
    const redis = this.client.config.get('redis')

    // No retry limit for blocking reads
    const options = {
      db: redis.db,
      ...(redis.password ? { password: redis.password } : {}),
      maxRetriesPerRequest: null,
    } as const

    return redis.url
      ? new RedisClient(redis.url, options)
      : new RedisClient(redis.port, redis.host, options)
  }

  /**
   * Start worker
   * @param {JobHandler} handler - Handler
   * @return {void}
   * @private
   */

  private _startWorker(handler: JobHandler): void {
    if (!this._connection || this._workers.has(handler.queueName)) return

    const config = this.config
    const meta = JOB_REGISTRY.get(handler.queueName)

    const worker = new Worker(
      handler.queueName,
      async (job: Job) =>
        handler.process({
          id: job.id ?? '',
          payload: (job.data ?? {}) as Record<string, unknown>,
          attempt: job.attemptsMade + 1,
        }),
      {
        connection: this._connection,
        prefix: config.prefix,
        concurrency: meta.concurrency ?? config.concurrency,
        stalledInterval: config.stalledIntervalMs,
      }
    )

    worker.on('failed', (_job, error) => {
      this.logger.error(`Job ${handler.queueName} failed`, error)
    })

    this._workers.set(handler.queueName, worker)
  }

  /**
   * Get queue stats
   * @param {JobName} name - Queue name
   * @return {Promise<JobStats>} - Stats
   * @private
   */

  private async _statsOf(name: JobName): Promise<JobStats> {
    const label = JOB_REGISTRY.label(name)
    const queue = this.get(name)

    const empty: JobStats = {
      name,
      label,
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      isPaused: false,
      hasWorker: this._handlers.has(name),
    }

    if (!queue) return empty

    try {
      const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed')

      return {
        ...empty,
        waiting: counts.waiting ?? 0,
        active: counts.active ?? 0,
        completed: counts.completed ?? 0,
        failed: counts.failed ?? 0,
        delayed: counts.delayed ?? 0,
        isPaused: await queue.isPaused(),
      }
    } catch (error) {
      this.logger.error(`Get stats for queue ${name} failed`, error)

      return empty
    }
  }
}
