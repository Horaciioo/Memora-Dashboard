import 'server-only'

import type Sharding from '@/managers/infrastructure/Core/Sharding'
import type LoggerManager from '@/managers/infrastructure/Core/LoggerManager'
import { SUBJECT_READERS } from '@/declarations/configurations/infrastructure'
import { readNode } from '@/declarations/configurations/readers'
import { CONFIG_SOURCES } from '@/declarations/configurations/sources'
import { APP_ENVIRONMENT, ENVIRONMENT_MANIFESTS } from '@/declarations/system/environments'
import { CONFIG_SUBJECTS } from '@/types/infrastructure'
import type {
  ConfigShapes,
  ConfigSubject,
  Environment,
  EnvironmentManifest,
} from '@/types/infrastructure'

// Environment variable placeholder pattern
const PLACEHOLDER = /^\$\{([A-Z0-9_]+)\}$/

/**
 * Configuration manager
 * @typedef {Object} ConfigManager
 * @property {Sharding} client - Client instance
 * @constructor
 */

export default class ConfigManager {
  private readonly client: Sharding

  /**
   * Resolved subjects cache
   * @type {Map<ConfigSubject, unknown>}
   * @private
   */

  private readonly _resolved = new Map<ConfigSubject, unknown>()

  /**
   * Missing required subjects
   * @type {ConfigSubject[]}
   * @private
   */

  private _missing: ConfigSubject[] = []

  /**
   * Create ConfigManager
   * @param {Sharding} client - Client instance
   */

  constructor(client: Sharding) {
    this.client = client
  }

  /**
   * Get logger instance
   * @return {LoggerManager} - Logger
   */

  get logger(): LoggerManager {
    return this.client.logger
  }

  /**
   * Get running environment
   * @return {Environment} - Environment key
   */

  get environment(): Environment {
    return APP_ENVIRONMENT
  }

  /**
   * Get environment manifest
   * @return {EnvironmentManifest} - Manifest
   */

  get manifest(): EnvironmentManifest {
    return ENVIRONMENT_MANIFESTS[this.environment]
  }

  /**
   * Get missing required subjects
   * @return {ConfigSubject[]} - Missing subjects
   */

  get missing(): ConfigSubject[] {
    return this._missing
  }

  /**
   * Get subject configuration
   * @template TSubject - Configuration subject
   * @param {TSubject} subject - Subject to read
   * @return {ConfigShapes[TSubject]} - Frozen config
   */

  get<TSubject extends ConfigSubject>(subject: TSubject): ConfigShapes[TSubject] {
    const cached = this._resolved.get(subject)
    if (cached) return cached as ConfigShapes[TSubject]

    const resolved = this._resolve(subject)
    this._resolved.set(subject, resolved)

    return resolved
  }

  /**
   * Check if subject enabled
   * @param {ConfigSubject} subject - Subject to test
   * @return {boolean} - Enabled status
   */

  isEnabled(subject: ConfigSubject): boolean {
    return this.get(subject).enabled
  }

  /**
   * Load all subjects
   * @return {Promise<void>} - Resolution
   */

  async load(): Promise<void> {
    CONFIG_SUBJECTS.forEach((subject) => this.get(subject))

    // Check missing required subjects
    this._missing = this.manifest.required.filter((subject) => !this.isEnabled(subject))

    if (this._missing.length > 0) {
      const detail = this._missing.join(', ')

      // Reject incomplete configuration
      if (this.manifest.strict) {
        throw new Error(
          `Incomplete configuration in ${this.manifest.label}, missing required subjects: ${detail}`
        )
      }

      this.logger.warn(`Missing required subjects in ${this.manifest.label}: ${detail}`)
    }

    this.logger.info(
      `Configuration loaded in ${this.manifest.label} (${CONFIG_SUBJECTS.length} subjects)`
    )
  }

  /**
   * Resolve subject configuration
   * @template TSubject - Configuration subject
   * @param {TSubject} subject - Subject to resolve
   * @return {ConfigShapes[TSubject]} - Frozen config
   * @private
   */

  private _resolve<TSubject extends ConfigSubject>(subject: TSubject): ConfigShapes[TSubject] {
    const environment = this.environment
    const path = `environments/${environment}/${subject}.${environment}.json`

    const defaults = readNode(CONFIG_SOURCES.default[subject], `default/${subject}.default.json`)

    const overrides = readNode(CONFIG_SOURCES.environments[environment][subject] ?? {}, path)

    const template = readNode(CONFIG_SOURCES.template[subject], `template/${subject}.template.json`)

    // Layer order: default, environment, template
    const merged = this._merge(this._merge(defaults, overrides), template)

    // Freeze to prevent consumer writes
    return Object.freeze(SUBJECT_READERS[subject](merged, path)) as ConfigShapes[TSubject]
  }

  /**
   * Merge overlay into base
   * @param {Record<string, unknown>} base - Fallback node
   * @param {Record<string, unknown>} overlay - Overriding node
   * @return {Record<string, unknown>} - Merged node
   * @private
   */

  private _merge(
    base: Record<string, unknown>,
    overlay: Record<string, unknown>
  ): Record<string, unknown> {
    const merged: Record<string, unknown> = { ...base }

    Object.entries(overlay).forEach(([key, value]) => {
      const fallback = base[key]

      // Recursively merge node objects
      if (this._isNode(value) && this._isNode(fallback)) {
        merged[key] = this._merge(fallback, value)

        return
      }

      const bound = this._bind(value, fallback)

      // Keep base if binding fails
      if (bound !== undefined) merged[key] = bound
    })

    return merged
  }

  /**
   * Bind placeholder to env var
   * @param {unknown} value - Overlay leaf
   * @param {unknown} fallback - Base leaf
   * @return {unknown} - Bound value
   * @private
   */

  private _bind(value: unknown, fallback: unknown): unknown {
    if (typeof value !== 'string') return value

    const variable = PLACEHOLDER.exec(value)?.[1]

    // Literal value wins
    if (!variable) return value

    const raw = process.env[variable]

    if (raw === undefined || raw.trim().length === 0) return undefined

    return this._coerce(raw.trim(), fallback)
  }

  /**
   * Coerce string to default type
   * @param {string} raw - Environment value
   * @param {unknown} fallback - Default leaf
   * @return {unknown} - Coerced value
   * @private
   */

  private _coerce(raw: string, fallback: unknown): unknown {
    if (typeof fallback === 'boolean') return raw === 'true'

    // Preserve string passwords by type checking
    if (typeof fallback === 'number') {
      const parsed = Number(raw)

      return Number.isFinite(parsed) ? parsed : raw
    }

    return raw
  }

  /**
   * Check if value is object
   * @param {unknown} value - Value to test
   * @return {boolean} - Is plain object
   * @private
   */

  private _isNode(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
}
