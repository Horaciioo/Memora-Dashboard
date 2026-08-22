import 'server-only'

import type Sharding from '@/managers/infrastructure/Core/Sharding'
import type LoggerManager from '@/managers/infrastructure/Core/LoggerManager'
import type { ProbeResult, ProbeStatus, UptimeConfig } from '@/types/infrastructure'

/**
 * Uptime manager
 * @typedef {Object} UptimeManager
 * @property {Sharding} client - Client instance
 * @constructor
 */

export default class UptimeManager {
  private readonly client: Sharding

  /**
   * Probe results
   * @type {Map<string, ProbeResult>}
   * @private
   */

  private readonly _results = new Map<string, ProbeResult>()

  /**
   * Probe interval
   * @type {?ReturnType<typeof setInterval>}
   * @private
   */

  private _timer: ReturnType<typeof setInterval> | null = null

  /**
   * Create UptimeManager
   * @param {Sharding} client - Client instance
   */

  constructor(client: Sharding) {
    this.client = client
  }

  /**
   * Get uptime config
   * @return {UptimeConfig} - Config
   */

  get config(): UptimeConfig {
    return this.client.config.get('uptime')
  }

  /**
   * Get logger instance
   * @return {LoggerManager} - Logger
   */

  get logger(): LoggerManager {
    return this.client.logger
  }

  /**
   * Get probe results
   * @return {ProbeResult[]} - Results
   */

  get results(): ProbeResult[] {
    return Array.from(this._results.values())
  }

  /**
   * Get aggregated status
   * @return {ProbeStatus} - Status
   */

  get status(): ProbeStatus {
    const results = this.results

    if (results.some((result) => result.status === 'down')) return 'down'
    if (results.some((result) => result.status === 'degraded')) return 'degraded'

    return 'up'
  }

  /**
   * Check health status
   * @return {boolean} - Healthy
   */

  isHealthy(): boolean {
    return this.status === 'up'
  }

  /**
   * Get probe result
   * @param {string} name - Probe name
   * @return {ProbeResult | null} - Result
   */

  getProbe(name: string): ProbeResult | null {
    return this._results.get(name) ?? null
  }

  /**
   * Run probe
   * @param {string} name - Probe name
   * @param {() => Promise<unknown>} check - Check function
   * @return {Promise<ProbeResult>} - Result
   */

  async probe(name: string, check: () => Promise<unknown>): Promise<ProbeResult> {
    const config = this.config
    const start = Date.now()

    /**
     * Store result
     * @param {ProbeStatus} status - Status
     * @param {string} [reason] - Failure reason
     * @return {ProbeResult} - Result
     */

    const settle = (status: ProbeStatus, reason?: string): ProbeResult => {
      const result: ProbeResult = {
        name,
        status,
        latencyMs: Date.now() - start,
        checkedAt: new Date().toISOString(),
        ...(reason ? { reason } : {}),
      }

      this._results.set(name, result)

      return result
    }

    try {
      // Race with timeout
      await Promise.race([
        check(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), config.timeoutMs)
        ),
      ])

      return settle(Date.now() - start > config.degradedMs ? 'degraded' : 'up')
    } catch (error) {
      return settle('down', error instanceof Error ? error.message : String(error))
    }
  }

  /**
   * Check all probes
   * @return {Promise<ProbeResult[]>} - Results
   */

  async check(): Promise<ProbeResult[]> {
    const checks = this._checks()

    // Filter to declared probes
    const declared = this.config.probes.flatMap((name) => {
      const check = checks[name]

      return check ? [{ name, check }] : []
    })

    return Promise.all(declared.map((entry) => this.probe(entry.name, entry.check)))
  }

  /**
   * Load uptime
   * @return {Promise<void>} - Completion
   */

  async load(): Promise<void> {
    const config = this.config

    if (!config.enabled) return

    // Initial check
    await this.check()
    await this._beat()

    this._timer = setInterval(() => {
      void this.check().then(() => this._beat())
    }, config.intervalMs)

    // Don't hold process
    this._timer.unref?.()

    this.logger.info(`Uptime probes ready (${config.probes.join(', ')})`)
  }

  /**
   * Close uptime
   * @return {Promise<void>} - Completion
   */

  async close(): Promise<void> {
    if (!this._timer) return

    clearInterval(this._timer)
    this._timer = null
  }

  /**
   * Get probe checks
   * @return {Record<string, () => Promise<unknown>>} - Checks
   * @private
   */

  private _checks(): Record<string, (() => Promise<unknown>) | undefined> {
    return {
      database: () => this.client.database.ping(),
      redis: () => this.client.redis.ping(),
    }
  }

  /**
   * Report heartbeat
   * @return {Promise<void>} - Completion
   * @private
   */

  private async _beat(): Promise<void> {
    const config = this.config

    if (!config.endpoint) return

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs)

    try {
      await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: this.status, probes: this.results }),
        signal: controller.signal,
      })
    } catch (error) {
      this.logger.warn('Heartbeat failed', {
        reason: error instanceof Error ? error.message : error,
      })
    } finally {
      clearTimeout(timeout)
    }
  }
}
