import 'server-only'

import type { Logtail } from '@logtail/node'

import type Sharding from '@/managers/infrastructure/Core/Sharding'
import type { LogLevel, TelemetryConfig } from '@/types/infrastructure'

/**
 * Telemetry manager
 * @typedef {Object} TelemetryManager
 * @property {Sharding} client - Client instance
 * @constructor
 */

export default class TelemetryManager {
  private readonly client: Sharding

  /**
   * Logtail client
   * @type {?Logtail}
   * @private
   */

  private _logtail: Logtail | null = null

  /**
   * Refused events
   * @type {number}
   * @private
   */

  private _refused = 0

  /**
   * Load state
   * @type {boolean}
   * @private
   */

  private _isLoaded = false

  /**
   * Create TelemetryManager
   * @param {Sharding} client - Client instance
   */

  constructor(client: Sharding) {
    this.client = client
  }

  /**
   * Get telemetry config
   * @return {TelemetryConfig} - Config
   */

  get config(): TelemetryConfig {
    return this.client.config.get('telemetry')
  }

  /**
   * Get synced events
   * @return {number} - Count
   */

  get synced(): number {
    return this._logtail?.synced ?? 0
  }

  /**
   * Get dropped events
   * @return {number} - Count
   */

  get dropped(): number {
    return (this._logtail?.dropped ?? 0) + this._refused
  }

  /**
   * Check if ready
   * @return {boolean} - Ready status
   */

  isReady(): boolean {
    return this._isLoaded && this._logtail !== null
  }

  /**
   * Queue log event
   * @param {LogLevel} level - Severity
   * @param {string} message - Message
   * @param {Record<string, unknown>} [context] - Context
   * @return {void}
   */

  log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    this.track(message, { level, context })
  }

  /**
   * Track event
   * @param {string} name - Event name
   * @param {Object} [payload] - Payload
   * @param {LogLevel} [payload.level] - Severity
   * @param {Record<string, unknown>} [payload.context] - Context
   * @return {void}
   */

  track(name: string, payload: { level?: LogLevel; context?: Record<string, unknown> } = {}): void {
    if (!this.isReady()) {
      this._refused += 1

      return
    }

    const level = payload.level ?? 'info'

    // Filter by level
    if (!this.config.levels.includes(level)) return

    // Ship asynchronously
    void this._logtail
      ?.log(name, level, { environment: this.client.config.environment, ...payload.context })
      .catch(() => {
        this._refused += 1
      })
  }

  /**
   * Load telemetry
   * @return {Promise<void>} - Completion
   */

  async load(): Promise<void> {
    const config = this.config

    this._isLoaded = true

    if (!config.enabled) return

    if (!config.sourceKey || !config.endpoint) {
      // Missing credentials
      this.client.logger.warn('Telemetry enabled without source/endpoint, no events will ship')

      return
    }

    try {
      // Lazy import to keep msgpack out of routes
      const { Logtail } = await import('@logtail/node')

      this._logtail = new Logtail(config.sourceKey, {
        endpoint: config.endpoint,
        batchSize: config.batch.size,
        batchSizeKiB: config.batch.sizeKiB,
        batchInterval: config.batch.flushMs,
        syncQueuedMax: config.batch.maxQueue,
        retryCount: config.retry.count,
        retryBackoff: config.retry.backoffMs,
        // Silent failures don't break requests
        ignoreExceptions: true,
        // Don't duplicate winston logs
        sendLogsToConsoleOutput: false,
      })

      this.client.logger.info(`Telemetry ready at ${config.endpoint}`)
    } catch (error) {
      this._logtail = null

      this.client.logger.error('Logtail client failed', error)
    }
  }

  /**
   * Flush queued events
   * @return {Promise<void>} - Completion
   */

  async flush(): Promise<void> {
    if (!this._logtail) return

    // Silent failure
    await this._logtail.flush().catch(() => undefined)
  }

  /**
   * Close telemetry
   * @return {Promise<void>} - Completion
   */

  async close(): Promise<void> {
    await this.flush()

    this._logtail = null
    this._isLoaded = false
  }
}
