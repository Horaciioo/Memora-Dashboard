import {
  readBoolean,
  readChoice,
  readInteger,
  readNode,
  readNumber,
  readOptionalString,
  readString,
  readStringList,
} from '@/declarations/configurations/readers'
import { LOG_LEVELS } from '@/types/infrastructure'
import type {
  ConfigShapes,
  ConfigSubject,
  DatabaseConfig,
  EncryptionConfig,
  LegacyEncryptionKey,
  LoggerConfig,
  QueuesConfig,
  RedisConfig,
  StorageConfig,
  TelemetryConfig,
  UptimeConfig,
} from '@/types/infrastructure'

// Retry shapes shared by redis and queues
const RETRY_STRATEGIES = ['fixed', 'exponential'] as const

// Persistence backends storage can target
const STORAGE_DRIVERS = ['database', 'remote'] as const

/**
 * Read database subject
 * @param {Record<string, unknown>} node - Merged node
 * @param {string} path - Path
 * @return {DatabaseConfig}
 */

const readDatabase = (node: Record<string, unknown>, path: string): DatabaseConfig => {
  const synchronize = readNode(node.synchronize, `${path}.synchronize`)

  return {
    enabled: readBoolean(node.enabled, { path: `${path}.enabled`, fallback: false }),
    ttl: readInteger(node.ttl, { path: `${path}.ttl`, fallback: 300, min: 1 }),
    synchronize: {
      status: readBoolean(synchronize.status, {
        path: `${path}.synchronize.status`,
        fallback: false,
      }),
      event: readString(synchronize.event, {
        path: `${path}.synchronize.event`,
        fallback: 'cache:mutation',
      }),
    },
  }
}

/**
 * Read redis subject
 * @param {Record<string, unknown>} node - Merged node
 * @param {string} path - Path
 * @return {RedisConfig}
 */

const readRedis = (node: Record<string, unknown>, path: string): RedisConfig => {
  const connection = readNode(node.connection, `${path}.connection`)
  const scan = readNode(node.scan, `${path}.scan`)

  return {
    enabled: readBoolean(node.enabled, { path: `${path}.enabled`, fallback: false }),
    prefix: readString(node.prefix, { path: `${path}.prefix`, fallback: 'dashboard:' }),
    url: readOptionalString(node.url, `${path}.url`),
    host: readString(node.host, { path: `${path}.host`, fallback: 'localhost' }),
    port: readInteger(node.port, { path: `${path}.port`, fallback: 6379, min: 1, max: 65535 }),
    password: readOptionalString(node.password, `${path}.password`),
    db: readInteger(node.db, { path: `${path}.db`, fallback: 0, min: 0 }),
    connection: {
      retryStrategy: readChoice(connection.retryStrategy, {
        path: `${path}.connection.retryStrategy`,
        fallback: 'exponential',
        allowed: RETRY_STRATEGIES,
      }),
      retryBackoffMs: readInteger(connection.retryBackoffMs, {
        path: `${path}.connection.retryBackoffMs`,
        fallback: 200,
        min: 0,
      }),
      retryMaxDelayMs: readInteger(connection.retryMaxDelayMs, {
        path: `${path}.connection.retryMaxDelayMs`,
        fallback: 5000,
        min: 0,
      }),
      maxRetries: readInteger(connection.maxRetries, {
        path: `${path}.connection.maxRetries`,
        fallback: 3,
        min: 0,
      }),
      commandTimeoutMs: readInteger(connection.commandTimeoutMs, {
        path: `${path}.connection.commandTimeoutMs`,
        fallback: 5000,
        min: 1,
      }),
      readyTimeoutMs: readInteger(connection.readyTimeoutMs, {
        path: `${path}.connection.readyTimeoutMs`,
        fallback: 10000,
        min: 1,
      }),
      heartbeatMs: readInteger(connection.heartbeatMs, {
        path: `${path}.connection.heartbeatMs`,
        fallback: 30000,
        min: 1000,
      }),
    },
    scan: {
      count: readInteger(scan.count, { path: `${path}.scan.count`, fallback: 100, min: 1 }),
    },
  }
}

/**
 * Read queues subject
 * @param {Record<string, unknown>} node - Merged node
 * @param {string} path - Path
 * @return {QueuesConfig}
 */

const readQueues = (node: Record<string, unknown>, path: string): QueuesConfig => {
  const backoff = readNode(node.backoff, `${path}.backoff`)

  return {
    enabled: readBoolean(node.enabled, { path: `${path}.enabled`, fallback: false }),
    prefix: readString(node.prefix, { path: `${path}.prefix`, fallback: 'dashboard:queues' }),
    attempts: readInteger(node.attempts, { path: `${path}.attempts`, fallback: 3, min: 1 }),
    concurrency: readInteger(node.concurrency, {
      path: `${path}.concurrency`,
      fallback: 4,
      min: 1,
    }),
    stalledIntervalMs: readInteger(node.stalledIntervalMs, {
      path: `${path}.stalledIntervalMs`,
      fallback: 30000,
      min: 1000,
    }),
    removeOnComplete: readInteger(node.removeOnComplete, {
      path: `${path}.removeOnComplete`,
      fallback: 100,
      min: 0,
    }),
    removeOnFail: readInteger(node.removeOnFail, {
      path: `${path}.removeOnFail`,
      fallback: 500,
      min: 0,
    }),
    backoff: {
      type: readChoice(backoff.type, {
        path: `${path}.backoff.type`,
        fallback: 'exponential',
        allowed: RETRY_STRATEGIES,
      }),
      delayMs: readInteger(backoff.delayMs, {
        path: `${path}.backoff.delayMs`,
        fallback: 1000,
        min: 0,
      }),
    },
  }
}

/**
 * Read storage subject
 * @param {Record<string, unknown>} node - Merged node
 * @param {string} path - Path
 * @return {StorageConfig}
 */

const readStorage = (node: Record<string, unknown>, path: string): StorageConfig => {
  const cache = readNode(node.cache, `${path}.cache`)
  const retry = readNode(node.retry, `${path}.retry`)
  const files = readNode(node.files, `${path}.files`)

  return {
    enabled: readBoolean(node.enabled, { path: `${path}.enabled`, fallback: false }),
    driver: readChoice(node.driver, {
      path: `${path}.driver`,
      fallback: 'database',
      allowed: STORAGE_DRIVERS,
    }),
    maxBytes: readInteger(node.maxBytes, {
      path: `${path}.maxBytes`,
      fallback: 10485760,
      min: 1,
    }),
    concurrency: readInteger(node.concurrency, {
      path: `${path}.concurrency`,
      fallback: 3,
      min: 1,
    }),
    cache: {
      ttlMs: readInteger(cache.ttlMs, { path: `${path}.cache.ttlMs`, fallback: 60000, min: 0 }),
    },
    retry: {
      attempts: readInteger(retry.attempts, {
        path: `${path}.retry.attempts`,
        fallback: 3,
        min: 1,
      }),
      initialDelayMs: readInteger(retry.initialDelayMs, {
        path: `${path}.retry.initialDelayMs`,
        fallback: 500,
        min: 0,
      }),
    },
    files: {
      authorized: readStringList(files.authorized, {
        path: `${path}.files.authorized`,
        fallback: [],
      }),
      blocked: readStringList(files.blocked, { path: `${path}.files.blocked`, fallback: [] }),
    },
  }
}

/**
 * Read one legacy key
 * @param {unknown} value - Raw entry
 * @param {string} path - Path
 * @return {LegacyEncryptionKey | null}
 */

const readLegacyKey = (value: unknown, path: string): LegacyEncryptionKey | null => {
  const node = readNode(value, path)

  // Drop entries missing their material
  if (typeof node.key !== 'string' || typeof node.iv !== 'string') {
    console.warn(`[config] ${path} is missing key or iv, ignoring`)

    return null
  }

  return {
    key: node.key,
    salt: readString(node.salt, { path: `${path}.salt`, fallback: '' }),
    iv: node.iv,
    ivSalt: readString(node.ivSalt, { path: `${path}.ivSalt`, fallback: '' }),
    algorithm: readString(node.algorithm, { path: `${path}.algorithm`, fallback: 'aes-256-gcm' }),
    iterations: readInteger(node.iterations, {
      path: `${path}.iterations`,
      fallback: 100000,
      min: 1,
    }),
    created: readString(node.created, {
      path: `${path}.created`,
      fallback: new Date(0).toISOString(),
    }),
  }
}

/**
 * Read encryption subject
 * @param {Record<string, unknown>} node - Merged node
 * @param {string} path - Path
 * @return {EncryptionConfig}
 */

const readEncryption = (node: Record<string, unknown>, path: string): EncryptionConfig => {
  const shared = readNode(node.shared, `${path}.shared`)
  const rawLegacy = Array.isArray(node.legacyKeys) ? node.legacyKeys : []

  return {
    enabled: readBoolean(node.enabled, { path: `${path}.enabled`, fallback: false }),
    algorithm: readString(node.algorithm, { path: `${path}.algorithm`, fallback: 'aes-256-gcm' }),
    key: readOptionalString(node.key, `${path}.key`),
    keySalt: readString(node.keySalt, { path: `${path}.keySalt`, fallback: '' }),
    iv: readOptionalString(node.iv, `${path}.iv`),
    ivSalt: readString(node.ivSalt, { path: `${path}.ivSalt`, fallback: '' }),
    keyLength: readInteger(node.keyLength, { path: `${path}.keyLength`, fallback: 32, min: 16 }),
    ivLength: readInteger(node.ivLength, { path: `${path}.ivLength`, fallback: 12, min: 8 }),
    iterations: readInteger(node.iterations, {
      path: `${path}.iterations`,
      fallback: 100000,
      min: 1,
    }),
    shared: {
      saltLength: readInteger(shared.saltLength, {
        path: `${path}.shared.saltLength`,
        fallback: 16,
        min: 8,
      }),
      iterations: readInteger(shared.iterations, {
        path: `${path}.shared.iterations`,
        fallback: 100000,
        min: 1,
      }),
    },
    legacyKeys: rawLegacy.flatMap((entry, index) => {
      const legacyKey = readLegacyKey(entry, `${path}.legacyKeys[${index}]`)

      return legacyKey ? [legacyKey] : []
    }),
  }
}

/**
 * Read telemetry subject
 * @param {Record<string, unknown>} node - Merged node
 * @param {string} path - Path
 * @return {TelemetryConfig}
 */

const readTelemetry = (node: Record<string, unknown>, path: string): TelemetryConfig => {
  const batch = readNode(node.batch, `${path}.batch`)
  const retry = readNode(node.retry, `${path}.retry`)

  return {
    enabled: readBoolean(node.enabled, { path: `${path}.enabled`, fallback: false }),
    sourceKey: readOptionalString(node.sourceKey, `${path}.sourceKey`),
    endpoint: readOptionalString(node.endpoint, `${path}.endpoint`),
    levels: readStringList(node.levels, {
      path: `${path}.levels`,
      fallback: ['warn', 'error'],
      allowed: LOG_LEVELS,
    }) as TelemetryConfig['levels'],
    batch: {
      size: readInteger(batch.size, { path: `${path}.batch.size`, fallback: 100, min: 1 }),
      sizeKiB: readInteger(batch.sizeKiB, { path: `${path}.batch.sizeKiB`, fallback: 512, min: 1 }),
      flushMs: readInteger(batch.flushMs, {
        path: `${path}.batch.flushMs`,
        fallback: 5000,
        min: 1,
      }),
      maxQueue: readInteger(batch.maxQueue, {
        path: `${path}.batch.maxQueue`,
        fallback: 1000,
        min: 1,
      }),
    },
    retry: {
      count: readInteger(retry.count, { path: `${path}.retry.count`, fallback: 3, min: 0 }),
      backoffMs: readInteger(retry.backoffMs, {
        path: `${path}.retry.backoffMs`,
        fallback: 1000,
        min: 0,
      }),
    },
  }
}

/**
 * Read logger subject
 * @param {Record<string, unknown>} node - Merged node
 * @param {string} path - Path
 * @return {LoggerConfig}
 */

const readLogger = (node: Record<string, unknown>, path: string): LoggerConfig => {
  const archive = readNode(node.archive, `${path}.archive`)

  return {
    enabled: readBoolean(node.enabled, { path: `${path}.enabled`, fallback: true }),
    level: readChoice(node.level, {
      path: `${path}.level`,
      fallback: 'info',
      allowed: LOG_LEVELS,
    }),
    console: readBoolean(node.console, { path: `${path}.console`, fallback: true }),
    file: readBoolean(node.file, { path: `${path}.file`, fallback: false }),
    directory: readString(node.directory, { path: `${path}.directory`, fallback: 'logs' }),
    telemetry: readBoolean(node.telemetry, { path: `${path}.telemetry`, fallback: false }),
    archive: {
      status: readBoolean(archive.status, { path: `${path}.archive.status`, fallback: false }),
      retentionDays: readInteger(archive.retentionDays, {
        path: `${path}.archive.retentionDays`,
        fallback: 14,
        min: 1,
      }),
    },
  }
}

/**
 * Read uptime subject
 * @param {Record<string, unknown>} node - Merged node
 * @param {string} path - Path
 * @return {UptimeConfig}
 */

const readUptime = (node: Record<string, unknown>, path: string): UptimeConfig => ({
  enabled: readBoolean(node.enabled, { path: `${path}.enabled`, fallback: false }),
  intervalMs: readInteger(node.intervalMs, {
    path: `${path}.intervalMs`,
    fallback: 60000,
    min: 1000,
  }),
  timeoutMs: readInteger(node.timeoutMs, { path: `${path}.timeoutMs`, fallback: 5000, min: 100 }),
  degradedMs: readNumber(node.degradedMs, {
    path: `${path}.degradedMs`,
    fallback: 1000,
    min: 0,
  }),
  endpoint: readOptionalString(node.endpoint, `${path}.endpoint`),
  probes: readStringList(node.probes, { path: `${path}.probes`, fallback: [] }),
})

/**
 * Subject readers
 * @type {{ [TSubject in ConfigSubject]: (node: Record<string, unknown>, path: string) => ConfigShapes[TSubject] }}
 */

export const SUBJECT_READERS: {
  [TSubject in ConfigSubject]: (
    node: Record<string, unknown>,
    path: string
  ) => ConfigShapes[TSubject]
} = {
  database: readDatabase,
  redis: readRedis,
  queues: readQueues,
  storage: readStorage,
  encryption: readEncryption,
  telemetry: readTelemetry,
  logger: readLogger,
  uptime: readUptime,
}
