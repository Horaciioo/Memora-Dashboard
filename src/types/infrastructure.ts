/**
 * Configuration subjects
 * @type {readonly string[]}
 */

export const CONFIG_SUBJECTS = [
  'database',
  'redis',
  'queues',
  'storage',
  'encryption',
  'telemetry',
  'logger',
  'uptime',
] as const

/**
 * Configuration subject
 * @type {(typeof CONFIG_SUBJECTS)[number]}
 */

export type ConfigSubject = (typeof CONFIG_SUBJECTS)[number]

/**
 * Log levels
 * @type {readonly string[]}
 */

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const

/**
 * Log level
 * @type {(typeof LOG_LEVELS)[number]}
 */

export type LogLevel = (typeof LOG_LEVELS)[number]

/**
 * Deployment environments
 * @type {readonly string[]}
 */

export const ENVIRONMENTS = ['dev', 'staging', 'release', 'main'] as const

/**
 * Deployment environment
 * @type {(typeof ENVIRONMENTS)[number]}
 */

export type Environment = (typeof ENVIRONMENTS)[number]

/**
 * Environment manifest
 * @typedef {Object} EnvironmentManifest
 * @property {string} label - Display name
 * @property {ConfigSubject[]} required - Mandatory subjects
 * @property {boolean} strict - Abort on missing
 */

export interface EnvironmentManifest {
  label: string
  required: ConfigSubject[]
  strict: boolean
}

/**
 * Cache synchronization
 * @typedef {Object} SynchronizeConfig
 * @property {boolean} status - Sync enabled
 * @property {string} event - Redis channel
 */

export interface SynchronizeConfig {
  status: boolean
  event: string
}

/**
 * Database configuration
 * @typedef {Object} DatabaseConfig
 * @property {boolean} enabled - Subject enabled
 * @property {number} ttl - Cache seconds
 * @property {SynchronizeConfig} synchronize - Cache sync
 */

export interface DatabaseConfig {
  enabled: boolean
  ttl: number
  synchronize: SynchronizeConfig
}

/**
 * Redis retry strategy
 * @type {'fixed' | 'exponential'}
 */

export type RetryStrategy = 'fixed' | 'exponential'

/**
 * Redis connection tuning
 * @typedef {Object} RedisConnectionConfig
 * @property {RetryStrategy} retryStrategy - Backoff shape
 * @property {number} retryBackoffMs - Base delay
 * @property {number} retryMaxDelayMs - Delay ceiling
 * @property {number} maxRetries - Retries per command
 * @property {number} commandTimeoutMs - Command timeout
 * @property {number} readyTimeoutMs - Connect timeout
 * @property {number} heartbeatMs - Ping interval
 */

export interface RedisConnectionConfig {
  retryStrategy: RetryStrategy
  retryBackoffMs: number
  retryMaxDelayMs: number
  maxRetries: number
  commandTimeoutMs: number
  readyTimeoutMs: number
  heartbeatMs: number
}

/**
 * Redis configuration
 * @typedef {Object} RedisConfig
 * @property {boolean} enabled - Subject enabled
 * @property {string} prefix - Key prefix
 * @property {?string} url - Connection URL
 * @property {string} host - Host name
 * @property {number} port - Port number
 * @property {?string} password - Auth password
 * @property {number} db - Database index
 * @property {RedisConnectionConfig} connection - Connection tuning
 * @property {{ count: number }} scan - Scan batch
 */

export interface RedisConfig {
  enabled: boolean
  prefix: string
  url: string | null
  host: string
  port: number
  password: string | null
  db: number
  connection: RedisConnectionConfig
  scan: { count: number }
}

/**
 * Queue backoff
 * @typedef {Object} QueueBackoffConfig
 * @property {RetryStrategy} type - Backoff shape
 * @property {number} delayMs - Base delay
 */

export interface QueueBackoffConfig {
  type: RetryStrategy
  delayMs: number
}

/**
 * Queues configuration
 * @typedef {Object} QueuesConfig
 * @property {boolean} enabled - Subject enabled
 * @property {string} prefix - Key prefix
 * @property {number} attempts - Default attempts
 * @property {number} concurrency - Worker concurrency
 * @property {number} stalledIntervalMs - Stall check
 * @property {number} removeOnComplete - Kept completed
 * @property {number} removeOnFail - Kept failed
 * @property {QueueBackoffConfig} backoff - Retry backoff
 */

export interface QueuesConfig {
  enabled: boolean
  prefix: string
  attempts: number
  concurrency: number
  stalledIntervalMs: number
  removeOnComplete: number
  removeOnFail: number
  backoff: QueueBackoffConfig
}

/**
 * Storage driver
 * @type {'database' | 'remote'}
 */

export type StorageDriver = 'database' | 'remote'

/**
 * Storage configuration
 * @typedef {Object} StorageConfig
 * @property {boolean} enabled - Subject enabled
 * @property {StorageDriver} driver - Active driver
 * @property {number} maxBytes - Size ceiling
 * @property {number} concurrency - Parallel uploads
 * @property {{ ttlMs: number }} cache - Metadata cache
 * @property {{ attempts: number, initialDelayMs: number }} retry - Upload retry
 * @property {{ authorized: string[], blocked: string[] }} files - Extension filters
 */

export interface StorageConfig {
  enabled: boolean
  driver: StorageDriver
  maxBytes: number
  concurrency: number
  cache: { ttlMs: number }
  retry: { attempts: number; initialDelayMs: number }
  files: { authorized: string[]; blocked: string[] }
}

/**
 * Retired encryption key
 * @typedef {Object} LegacyEncryptionKey
 * @property {string} key - Key material
 * @property {string} salt - Key salt
 * @property {string} iv - Vector material
 * @property {string} ivSalt - Vector salt
 * @property {string} algorithm - Cipher name
 * @property {number} iterations - Derivation rounds
 * @property {string} created - ISO date
 */

export interface LegacyEncryptionKey {
  key: string
  salt: string
  iv: string
  ivSalt: string
  algorithm: string
  iterations: number
  created: string
}

/**
 * Encryption configuration
 * @typedef {Object} EncryptionConfig
 * @property {boolean} enabled - Subject enabled
 * @property {string} algorithm - Cipher name
 * @property {?string} key - Key material
 * @property {string} keySalt - Key salt
 * @property {?string} iv - Vector material
 * @property {string} ivSalt - Vector salt
 * @property {number} keyLength - Key bytes
 * @property {number} ivLength - Vector bytes
 * @property {number} iterations - Derivation rounds
 * @property {{ saltLength: number, iterations: number }} shared - Shared secrets
 * @property {LegacyEncryptionKey[]} legacyKeys - Retired keys
 */

export interface EncryptionConfig {
  enabled: boolean
  algorithm: string
  key: string | null
  keySalt: string
  iv: string | null
  ivSalt: string
  keyLength: number
  ivLength: number
  iterations: number
  shared: { saltLength: number; iterations: number }
  legacyKeys: LegacyEncryptionKey[]
}

/**
 * Telemetry configuration
 * @typedef {Object} TelemetryConfig
 * @property {boolean} enabled - Subject enabled
 * @property {?string} sourceKey - Ingest key
 * @property {?string} endpoint - Ingest URL
 * @property {LogLevel[]} levels - Forwarded levels
 * @property {{ size: number, sizeKiB: number, flushMs: number, maxQueue: number }} batch - Batching
 * @property {{ count: number, backoffMs: number }} retry - Send retry
 */

export interface TelemetryConfig {
  enabled: boolean
  sourceKey: string | null
  endpoint: string | null
  levels: LogLevel[]
  batch: { size: number; sizeKiB: number; flushMs: number; maxQueue: number }
  retry: { count: number; backoffMs: number }
}

/**
 * Logger configuration
 * @typedef {Object} LoggerConfig
 * @property {boolean} enabled - Subject enabled
 * @property {LogLevel} level - Minimum level
 * @property {boolean} console - Console transport
 * @property {boolean} file - File transport
 * @property {string} directory - Log directory
 * @property {boolean} telemetry - Forward to telemetry
 * @property {{ status: boolean, retentionDays: number }} archive - Rotation
 */

export interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  console: boolean
  file: boolean
  directory: string
  telemetry: boolean
  archive: { status: boolean; retentionDays: number }
}

/**
 * Probe status
 * @type {'up' | 'degraded' | 'down'}
 */

export type ProbeStatus = 'up' | 'degraded' | 'down'

/**
 * Probe result
 * @typedef {Object} ProbeResult
 * @property {string} name - Probe name
 * @property {ProbeStatus} status - Resolved status
 * @property {number} latencyMs - Elapsed time
 * @property {string} checkedAt - ISO date
 * @property {string} [reason] - Failure reason
 */

export interface ProbeResult {
  name: string
  status: ProbeStatus
  latencyMs: number
  checkedAt: string
  reason?: string
}

/**
 * Uptime configuration
 * @typedef {Object} UptimeConfig
 * @property {boolean} enabled - Subject enabled
 * @property {number} intervalMs - Check interval
 * @property {number} timeoutMs - Probe timeout
 * @property {number} degradedMs - Degraded threshold
 * @property {?string} endpoint - Heartbeat URL
 * @property {string[]} probes - Active probes
 */

export interface UptimeConfig {
  enabled: boolean
  intervalMs: number
  timeoutMs: number
  degradedMs: number
  endpoint: string | null
  probes: string[]
}

/**
 * Subject shapes
 * @typedef {Object} ConfigShapes
 * @property {DatabaseConfig} database - Database shape
 * @property {RedisConfig} redis - Redis shape
 * @property {QueuesConfig} queues - Queues shape
 * @property {StorageConfig} storage - Storage shape
 * @property {EncryptionConfig} encryption - Encryption shape
 * @property {TelemetryConfig} telemetry - Telemetry shape
 * @property {LoggerConfig} logger - Logger shape
 * @property {UptimeConfig} uptime - Uptime shape
 */

export interface ConfigShapes {
  database: DatabaseConfig
  redis: RedisConfig
  queues: QueuesConfig
  storage: StorageConfig
  encryption: EncryptionConfig
  telemetry: TelemetryConfig
  logger: LoggerConfig
  uptime: UptimeConfig
}
