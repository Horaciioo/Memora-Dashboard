import 'server-only'

import fs from 'fs/promises'
import path from 'path'

import { createLogger, format, transports } from 'winston'
import type { Logger } from 'winston'

import { APP_NAME } from '@/declarations/app'
import { captureException } from '@/core/lib/sentry'
import type Sharding from '@/managers/infrastructure/Core/Sharding'
import type TelemetryManager from '@/managers/infrastructure/Monitoring/TelemetryManager'
import { LOG_LEVELS } from '@/types/infrastructure'
import type { LoggerConfig, LogLevel } from '@/types/infrastructure'

// Latest log file path
const LATEST_FILE = 'latest.log'

/**
 * Format arguments
 * @param {...unknown} args - Arguments to log
 * @return {string} - Formatted line
 */

export const formatArgs = (...args: unknown[]): string => {
  // Skip empty args
  if (args.length === 0) return ''

  /**
   * Render argument
   * @param {unknown} arg - Argument to render
   * @return {string} - Rendered text
   */

  const render = (arg: unknown): string => {
    // Handle errors
    if (arg instanceof Error) return arg.stack || arg.message

    // Handle objects
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.stringify(arg, null, 2)
      } catch {
        // Circular ref fallback
        return String(arg)
      }
    }

    // Handle primitives
    return String(arg)
  }

  return args.map(render).join(' ')
}

/**
 * Logger manager
 * @typedef {Object} LoggerManager
 * @property {Sharding} client - Client instance
 * @constructor
 */

export default class LoggerManager {
  private readonly client: Sharding

  /**
   * Winston instance
   * @type {?Logger}
   * @private
   */

  private _logger: Logger | null = null

  /**
   * Log directory
   * @type {?string}
   * @private
   */

  private _directory: string | null = null

  /**
   * Create LoggerManager
   * @param {Sharding} client - Client instance
   */

  constructor(client: Sharding) {
    this.client = client
  }

  /**
   * Get telemetry manager
   * @return {TelemetryManager} - Manager
   */

  get telemetry(): TelemetryManager {
    return this.client.telemetry
  }

  /**
   * Get logger config
   * @return {LoggerConfig} - Configuration
   */

  get config(): LoggerConfig {
    return this.client.config.get('logger')
  }

  /**
   * Create log header
   * @return {string} - Header text
   * @private
   */

  private _createHeader(): string {
    return [
      `App: ${APP_NAME}`,
      `Environment: ${this.client.config.manifest.label}`,
      `Node: ${process.version}`,
      `Start Time: ${new Date().toISOString()}`,
      `PID: ${process.pid}`,
      '',
    ].join('\n')
  }

  /**
   * Log telemetry event
   * @param {LogLevel} level - Log level
   * @param {string} message - Message text
   * @return {void}
   * @private
   */

  private _telemetryLog(level: LogLevel, message: string): void {
    // Skip if disabled
    if (!this.config.telemetry) return

    // Fire telemetry asynchronously
    this.telemetry.log(level, message)
  }

  /**
   * Check log level
   * @param {LogLevel} level - Level to test
   * @return {boolean} - Passes floor
   * @private
   */

  private _passes(level: LogLevel): boolean {
    return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(this.config.level)
  }

  /**
   * Archive log file
   * @param {string} latest - Latest file path
   * @return {Promise<void>} - Completion
   * @private
   */

  private async _archive(latest: string): Promise<void> {
    let size = 0
    let created = new Date()

    try {
      const stats = await fs.stat(latest)

      size = stats.size
      created = stats.ctime
    } catch {
      // No previous file
      return
    }

    // Skip empty files
    if (size === 0) return

    const year = String(created.getFullYear())
    const month = String(created.getMonth() + 1).padStart(2, '0')
    const day = String(created.getDate()).padStart(2, '0')

    const directory = path.join(path.dirname(latest), year, month, day)

    await fs.mkdir(directory, { recursive: true })
    await fs.rename(latest, path.join(directory, `${created.getTime()}.log`))
  }

  /**
   * Prune old archives
   * @return {Promise<void>} - Completion
   * @private
   */

  private async _prune(): Promise<void> {
    if (!this._directory) return

    const horizon = Date.now() - this.config.archive.retentionDays * 86400000

    // Walk year folders
    const years = await fs.readdir(this._directory, { withFileTypes: true }).catch(() => [])

    for (const year of years) {
      if (!year.isDirectory()) continue

      const yearPath = path.join(this._directory, year.name)
      const months = await fs.readdir(yearPath, { withFileTypes: true }).catch(() => [])

      for (const month of months) {
        if (!month.isDirectory()) continue

        const monthPath = path.join(yearPath, month.name)
        const days = await fs.readdir(monthPath, { withFileTypes: true }).catch(() => [])

        for (const day of days) {
          if (!day.isDirectory()) continue

          const dayPath = path.join(monthPath, day.name)
          const stamp = Date.parse(`${year.name}-${month.name}-${day.name}T00:00:00Z`)

          if (Number.isFinite(stamp) && stamp < horizon) {
            await fs.rm(dayPath, { recursive: true, force: true }).catch(() => undefined)
          }
        }
      }
    }
  }

  /**
   * Load logger
   * @return {Promise<void>} - Completion
   */

  async load(): Promise<void> {
    const config = this.config

    if (!config.enabled) return

    const chosen: NonNullable<Parameters<typeof createLogger>[0]>['transports'] = []

    if (config.file) {
      // Set directory path
      this._directory = path.join(process.cwd(), config.directory)

      const latest = path.join(this._directory, LATEST_FILE)

      await fs.mkdir(this._directory, { recursive: true })

      if (config.archive.status) {
        await this._archive(latest)
        await this._prune()
      }

      // Write header to latest log
      await fs.writeFile(latest, this._createHeader())

      chosen.push(new transports.File({ filename: latest }))
    }

    if (config.console) chosen.push(new transports.Console())

    // No transports available
    if (chosen.length === 0) return

    const logFormat = format.combine(
      format.printf((info) => {
        const stamp = new Date().toISOString().replace('T', ' ').slice(0, 19)

        return `${stamp} | ${APP_NAME} - ${String(info.level).toUpperCase()} » ${info.message}`
      })
    )

    this._logger = createLogger({
      level: config.level,
      format: logFormat,
      transports: chosen,
    })
  }

  /**
   * Write log line
   * @param {LogLevel} level - Log level
   * @param {unknown[]} args - Arguments to log
   * @return {void}
   * @private
   */

  private _write(level: LogLevel, args: unknown[]): void {
    const message = formatArgs(...args)

    if (!this._passes(level)) return

    // Route to Winston or console
    if (this._logger) this._logger.log(level, message)
    else if (level === 'error') console.error(message)
    else if (level === 'warn') console.warn(message)
    else console.log(message)

    this._telemetryLog(level, message)
  }

  /**
   * Debug log
   * @param {...unknown} args - Arguments
   * @return {void}
   */

  debug(...args: unknown[]): void {
    this._write('debug', args)
  }

  /**
   * Info log
   * @param {...unknown} args - Arguments
   * @return {void}
   */

  info(...args: unknown[]): void {
    this._write('info', args)
  }

  /**
   * Warning log
   * @param {...unknown} args - Arguments
   * @return {void}
   */

  warn(...args: unknown[]): void {
    this._write('warn', args)
  }

  /**
   * Error log
   * @param {...unknown} args - Arguments
   * @return {void}
   */

  error(...args: unknown[]): void {
    this._write('error', args)

    const cause = args.find((arg): arg is Error => arg instanceof Error)

    if (cause) captureException(cause, { message: formatArgs(args[0]) })
  }

  /**
   * Write raw message
   * @param {string} message - Message text
   * @return {void}
   */

  write(message: string): void {
    this.info(message.trim())
  }
}
