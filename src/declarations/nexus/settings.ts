import nexus from '@/configurations/system/nexus.json'
import { readInteger, readNode, readStringList } from '@/declarations/configurations/readers'

const password = readNode(nexus.password, 'system/nexus.password')
const session = readNode(nexus.session, 'system/nexus.session')
const attempts = readNode(nexus.attempts, 'system/nexus.attempts')
const modes = readNode(nexus.modes, 'system/nexus.modes')
const commands = readNode(nexus.commands, 'system/nexus.commands')
const retention = readNode(nexus.retention, 'system/nexus.retention')
const redaction = readNode(nexus.redaction, 'system/nexus.redaction')

// Positive integer list
const readSeconds = (value: unknown, fallback: number[]): number[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((entry) => Number.isInteger(entry) && entry > 0)
    ? (value as number[])
    : fallback

/**
 * Argon2id cost and password bounds
 * @type {{ memoryKib: number, iterations: number, parallelism: number, minLength: number, maxLength: number }}
 */

export const NEXUS_PASSWORD = {
  memoryKib: readInteger(password.memoryKib, {
    path: 'system/nexus.password.memoryKib',
    fallback: 65536,
    min: 19456,
    max: 1048576,
  }),
  iterations: readInteger(password.iterations, {
    path: 'system/nexus.password.iterations',
    fallback: 3,
    min: 2,
    max: 10,
  }),
  parallelism: readInteger(password.parallelism, {
    path: 'system/nexus.password.parallelism',
    fallback: 1,
    min: 1,
    max: 8,
  }),
  minLength: readInteger(password.minLength, {
    path: 'system/nexus.password.minLength',
    fallback: 16,
    min: 12,
    max: 128,
  }),
  maxLength: readInteger(password.maxLength, {
    path: 'system/nexus.password.maxLength',
    fallback: 256,
    min: 32,
    max: 1024,
  }),
}

/**
 * Handshake and reauthentication bounds
 * @type {{ pendingSeconds: number, dangerReauthSeconds: number }}
 */

export const NEXUS_SESSION = {
  pendingSeconds: readInteger(session.pendingSeconds, {
    path: 'system/nexus.session.pendingSeconds',
    fallback: 180,
    min: 30,
    max: 900,
  }),
  dangerReauthSeconds: readInteger(session.dangerReauthSeconds, {
    path: 'system/nexus.session.dangerReauthSeconds',
    fallback: 300,
    min: 30,
    max: 3600,
  }),
}

/**
 * Failed attempt policy
 * @type {{ windowMinutes: number, maxFailures: number, backoffSeconds: number[], lockoutMinutes: number, dayFailures: number, dayLockoutHours: number }}
 */

export const NEXUS_ATTEMPTS = {
  windowMinutes: readInteger(attempts.windowMinutes, {
    path: 'system/nexus.attempts.windowMinutes',
    fallback: 15,
    min: 1,
    max: 1440,
  }),
  maxFailures: readInteger(attempts.maxFailures, {
    path: 'system/nexus.attempts.maxFailures',
    fallback: 5,
    min: 1,
    max: 50,
  }),
  backoffSeconds: readSeconds(attempts.backoffSeconds, [1, 2, 4, 8]),
  lockoutMinutes: readInteger(attempts.lockoutMinutes, {
    path: 'system/nexus.attempts.lockoutMinutes',
    fallback: 30,
    min: 1,
    max: 1440,
  }),
  dayFailures: readInteger(attempts.dayFailures, {
    path: 'system/nexus.attempts.dayFailures',
    fallback: 20,
    min: 1,
    max: 500,
  }),
  dayLockoutHours: readInteger(attempts.dayLockoutHours, {
    path: 'system/nexus.attempts.dayLockoutHours',
    fallback: 24,
    min: 1,
    max: 168,
  }),
}

/**
 * Armed mode durations
 * @type {{ writeMinutes: number, writeMaxMinutes: number, dangerMinutes: number }}
 */

export const NEXUS_MODES = {
  writeMinutes: readInteger(modes.writeMinutes, {
    path: 'system/nexus.modes.writeMinutes',
    fallback: 15,
    min: 1,
    max: 120,
  }),
  writeMaxMinutes: readInteger(modes.writeMaxMinutes, {
    path: 'system/nexus.modes.writeMaxMinutes',
    fallback: 15,
    min: 1,
    max: 120,
  }),
  dangerMinutes: readInteger(modes.dangerMinutes, {
    path: 'system/nexus.modes.dangerMinutes',
    fallback: 5,
    min: 1,
    max: 30,
  }),
}

/**
 * Command engine bounds
 * @type {{ maxLength: number, maxArguments: number, timeoutMs: number, maxRows: number, pageSize: number, confirmSeconds: number, auditPageSize: number }}
 */

export const NEXUS_COMMANDS = {
  maxLength: readInteger(commands.maxLength, {
    path: 'system/nexus.commands.maxLength',
    fallback: 2000,
    min: 100,
    max: 20000,
  }),
  maxArguments: readInteger(commands.maxArguments, {
    path: 'system/nexus.commands.maxArguments',
    fallback: 30,
    min: 1,
    max: 100,
  }),
  timeoutMs: readInteger(commands.timeoutMs, {
    path: 'system/nexus.commands.timeoutMs',
    fallback: 10000,
    min: 500,
    max: 120000,
  }),
  maxRows: readInteger(commands.maxRows, {
    path: 'system/nexus.commands.maxRows',
    fallback: 200,
    min: 1,
    max: 5000,
  }),
  pageSize: readInteger(commands.pageSize, {
    path: 'system/nexus.commands.pageSize',
    fallback: 50,
    min: 1,
    max: 500,
  }),
  confirmSeconds: readInteger(commands.confirmSeconds, {
    path: 'system/nexus.commands.confirmSeconds',
    fallback: 120,
    min: 10,
    max: 900,
  }),
  auditPageSize: readInteger(commands.auditPageSize, {
    path: 'system/nexus.commands.auditPageSize',
    fallback: 50,
    min: 1,
    max: 500,
  }),
}

/**
 * Column name fragments always masked
 * @type {string[]}
 */

export const NEXUS_MASKED_PATTERNS = readStringList(redaction.patterns, {
  path: 'system/nexus.redaction.patterns',
  fallback: ['token', 'secret', 'password', 'hash', 'key', 'cookie', 'vapid'],
})

/**
 * Retention in days
 * @type {{ auditDays: number, attemptDays: number }}
 */

export const NEXUS_RETENTION = {
  auditDays: readInteger(retention.auditDays, {
    path: 'system/nexus.retention.auditDays',
    fallback: 365,
    min: 30,
    max: 3650,
  }),
  attemptDays: readInteger(retention.attemptDays, {
    path: 'system/nexus.retention.attemptDays',
    fallback: 30,
    min: 7,
    max: 365,
  }),
}
