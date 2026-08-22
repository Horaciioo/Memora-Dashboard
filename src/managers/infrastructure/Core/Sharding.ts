import 'server-only'

import { bindLogger, unbindLogger } from '@/core/lib/logger'
import ConfigManager from '@/managers/infrastructure/Core/ConfigManager'
import LoggerManager from '@/managers/infrastructure/Core/LoggerManager'
import DatabaseManager from '@/managers/infrastructure/Database/DatabaseManager'
import TelemetryManager from '@/managers/infrastructure/Monitoring/TelemetryManager'
import UptimeManager from '@/managers/infrastructure/Monitoring/UptimeManager'
import QueueManager from '@/managers/infrastructure/Network/QueueManager'
import RedisManager from '@/managers/infrastructure/Network/RedisManager'
import StorageManager from '@/managers/infrastructure/Network/StorageManager'
import EncryptionManager from '@/managers/infrastructure/Security/EncryptionManager'
import type { ConfigSubject, Environment } from '@/types/infrastructure'

// Root infrastructure container
export default class Sharding {
  /**
   * Configuration manager
   * @type {ConfigManager}
   */

  readonly config: ConfigManager

  /**
   * Logger manager
   * @type {LoggerManager}
   */

  readonly logger: LoggerManager

  /**
   * Telemetry manager
   * @type {TelemetryManager}
   */

  readonly telemetry: TelemetryManager

  /**
   * Encryption manager
   * @type {EncryptionManager}
   */

  readonly encryption: EncryptionManager

  /**
   * Redis manager
   * @type {RedisManager}
   */

  readonly redis: RedisManager

  /**
   * Database manager
   * @type {DatabaseManager}
   */

  readonly database: DatabaseManager

  /**
   * Queue manager
   * @type {QueueManager}
   */

  readonly queues: QueueManager

  /**
   * Storage manager
   * @type {StorageManager}
   */

  readonly storage: StorageManager

  /**
   * Uptime manager
   * @type {UptimeManager}
   */

  readonly uptime: UptimeManager

  /**
   * Load complete flag
   * @type {boolean}
   * @private
   */

  private _isLoaded = false

  /**
   * Loading promise
   * @type {?Promise<void>}
   * @private
   */

  private _loading: Promise<void> | null = null

  // Wire managers only
  constructor() {
    this.config = new ConfigManager(this)
    this.logger = new LoggerManager(this)
    this.telemetry = new TelemetryManager(this)
    this.encryption = new EncryptionManager(this)
    this.redis = new RedisManager(this)
    this.database = new DatabaseManager(this)
    this.queues = new QueueManager(this)
    this.storage = new StorageManager(this)
    this.uptime = new UptimeManager(this)
  }

  /**
   * Get running environment
   * @return {Environment} - Environment key
   */

  get environment(): Environment {
    return this.config.environment
  }

  /**
   * Check if loaded
   * @return {boolean} - Load status
   */

  isLoaded(): boolean {
    return this._isLoaded
  }

  /**
   * Load all managers
   * @return {Promise<void>} - Completion
   */

  async load(): Promise<void> {
    if (this._isLoaded) return
    if (this._loading) return this._loading

    this._loading = this._load().finally(() => {
      this._loading = null
    })

    return this._loading
  }

  /**
   * Run boot sequence
   * @return {Promise<void>} - Completion
   * @private
   */

  private async _load(): Promise<void> {
    // Load config first
    await this.config.load()

    // Load logger next
    await this.logger.load()

    // Bind logger facade
    bindLogger({
      debug: (...args: unknown[]) => this.logger.debug(...args),
      info: (...args: unknown[]) => this.logger.info(...args),
      warn: (...args: unknown[]) => this.logger.warn(...args),
      error: (...args: unknown[]) => this.logger.error(...args),
    })

    await this._loadSubject('telemetry', () => this.telemetry.load())
    await this._loadSubject('encryption', () => this.encryption.load())
    await this._loadSubject('redis', () => this.redis.load())
    await this._loadSubject('database', () => this.database.load())
    await this._loadSubject('queues', () => this.queues.load())
    await this._loadSubject('storage', () => this.storage.load())
    await this._loadSubject('uptime', () => this.uptime.load())

    this._isLoaded = true

    this.logger.info(`Infrastructure ready in ${this.config.manifest.label}`)
  }

  /**
   * Load one subject
   * @param {ConfigSubject} subject - Subject name
   * @param {() => Promise<void>} load - Load function
   * @return {Promise<void>} - Completion
   * @private
   */

  private async _loadSubject(subject: ConfigSubject, load: () => Promise<void>): Promise<void> {
    try {
      await load()
    } catch (error) {
      this.logger.error(`Failed to load ${subject}`, error)

      // Abort if required subject fails
      if (this.config.manifest.required.includes(subject)) throw error
    }
  }

  /**
   * Close all managers
   * @return {Promise<void>} - Completion
   */

  async close(): Promise<void> {
    if (!this._isLoaded) return

    await this.uptime.close().catch(() => undefined)
    await this.queues.closeAll().catch(() => undefined)
    await this.database.close().catch(() => undefined)
    await this.redis.disconnect().catch(() => undefined)
    await this.telemetry.close().catch(() => undefined)

    this.storage.clearCache()

    unbindLogger()

    this._isLoaded = false
  }
}
