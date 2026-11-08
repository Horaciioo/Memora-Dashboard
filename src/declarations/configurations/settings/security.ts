import twoFactor from '@/configurations/system/two-factor.json'
import authentication from '@/configurations/system/authentication.json'
import cache from '@/configurations/system/cache.json'
import timeouts from '@/configurations/system/timeouts.json'
import retention from '@/configurations/system/retention.json'
import failures from '@/configurations/system/failures.json'
import rateLimits from '@/configurations/system/rate-limits.json'
import perimeter from '@/configurations/system/perimeter.json'
import { readBoolean, readInteger, readNode } from '@/declarations/configurations/readers'

/**
 * Creator perimeter settings
 * @type {{ includeUnassigned: boolean }}
 */

export const SCOPE_SETTINGS = {
  includeUnassigned: readBoolean(perimeter.includeUnassigned, {
    path: 'system/perimeter.includeUnassigned',
    fallback: true,
  }),
}

/**
 * Sign-in and session bounds
 * @type {{ sessionDays: number, stateTtlSeconds: number, avatarSize: number, bannerSize: number, maxConcurrentSessions: number }}
 */

export const AUTH_SETTINGS = {
  sessionDays: readInteger(authentication.sessionDays, {
    path: 'system/authentication.sessionDays',
    fallback: 14,
    min: 1,
    max: 90,
  }),
  stateTtlSeconds: readInteger(authentication.stateTtlSeconds, {
    path: 'system/authentication.stateTtlSeconds',
    fallback: 600,
    min: 60,
    max: 3600,
  }),
  avatarSize: readInteger(authentication.avatarSize, {
    path: 'system/authentication.avatarSize',
    fallback: 128,
    min: 16,
    max: 4096,
  }),
  bannerSize: readInteger(authentication.bannerSize, {
    path: 'system/authentication.bannerSize',
    fallback: 1024,
    min: 16,
    max: 4096,
  }),
  maxConcurrentSessions: readInteger(authentication.maxConcurrentSessions, {
    path: 'system/authentication.maxConcurrentSessions',
    fallback: 10,
    min: 1,
  }),
  // Life of a Discord identity check
  identityCheckHours: readInteger(authentication.identityCheckHours, {
    path: 'system/authentication.identityCheckHours',
    fallback: 48,
    min: 1,
    max: 336,
  }),
  // Pseudonyms asked before a responsable is called
  identityAttempts: readInteger(authentication.identityAttempts, {
    path: 'system/authentication.identityAttempts',
    fallback: 2,
    min: 1,
    max: 5,
  }),
}

/**
 * Second factor bounds
 * @type {{ digits: number, periodSeconds: number, driftSteps: number, secretBytes: number, recoveryCodeCount: number, recoveryCodeBytes: number, unlockMinutes: number, enrolmentMinutes: number }}
 */

export const TWO_FACTOR_SETTINGS = {
  digits: readInteger(twoFactor.digits, {
    path: 'system/two-factor.digits',
    fallback: 6,
    min: 6,
    max: 8,
  }),
  periodSeconds: readInteger(twoFactor.periodSeconds, {
    path: 'system/two-factor.periodSeconds',
    fallback: 30,
    min: 15,
    max: 120,
  }),
  driftSteps: readInteger(twoFactor.driftSteps, {
    path: 'system/two-factor.driftSteps',
    fallback: 1,
    min: 0,
    max: 5,
  }),
  secretBytes: readInteger(twoFactor.secretBytes, {
    path: 'system/two-factor.secretBytes',
    fallback: 20,
    min: 16,
    max: 64,
  }),
  recoveryCodeCount: readInteger(twoFactor.recoveryCodeCount, {
    path: 'system/two-factor.recoveryCodeCount',
    fallback: 10,
    min: 1,
    max: 32,
  }),
  recoveryCodeBytes: readInteger(twoFactor.recoveryCodeBytes, {
    path: 'system/two-factor.recoveryCodeBytes',
    fallback: 5,
    min: 4,
    max: 16,
  }),
  unlockMinutes: readInteger(twoFactor.unlockMinutes, {
    path: 'system/two-factor.unlockMinutes',
    fallback: 15,
    min: 1,
    max: 720,
  }),
  enrolmentMinutes: readInteger(twoFactor.enrolmentMinutes, {
    path: 'system/two-factor.enrolmentMinutes',
    fallback: 10,
    min: 1,
    max: 60,
  }),
}

/**
 * One rate limit window
 * @typedef {Object} RateLimitWindow
 * @property {number} windowSeconds - Window length
 * @property {number} max - Attempts allowed
 */

export interface RateLimitWindow {
  windowSeconds: number
  max: number
}

/**
 * Read one rate limit window
 * @param {string} name - Policy name
 * @param {RateLimitWindow} fallback - Default window
 * @return {RateLimitWindow} - Bounded window
 */

export const readRateLimitWindow = (name: string, fallback: RateLimitWindow): RateLimitWindow => {
  const path = `system/rate-limits.${name}`
  const node = readNode((rateLimits as Record<string, unknown>)[name], path)

  return {
    windowSeconds: readInteger(node.windowSeconds, {
      path: `${path}.windowSeconds`,
      fallback: fallback.windowSeconds,
      min: 1,
    }),
    max: readInteger(node.max, { path: `${path}.max`, fallback: fallback.max, min: 1 }),
  }
}

/**
 * How long each family of personal data is kept
 * @type {{ expiredSessionDays: number, readNotificationDays: number, activityLogDays: number, moderationLogDays: number, chatMessageDays: number, rejectedCandidateDays: number, bannedCandidateDays: number, orphanFileHours: number, consentVersion: number }}
 */

export const RETENTION_SETTINGS = {
  expiredSessionDays: readInteger(retention.expiredSessionDays, {
    path: 'system/retention.expiredSessionDays',
    fallback: 7,
    min: 1,
  }),
  readNotificationDays: readInteger(retention.readNotificationDays, {
    path: 'system/retention.readNotificationDays',
    fallback: 90,
    min: 1,
  }),
  pushDeliveryDays: readInteger(retention.pushDeliveryDays, {
    path: 'system/retention.pushDeliveryDays',
    fallback: 30,
    min: 1,
  }),
  activityLogDays: readInteger(retention.activityLogDays, {
    path: 'system/retention.activityLogDays',
    fallback: 365,
    min: 30,
  }),
  moderationLogDays: readInteger(retention.moderationLogDays, {
    path: 'system/retention.moderationLogDays',
    fallback: 180,
    min: 7,
  }),
  chatMessageDays: readInteger(retention.chatMessageDays, {
    path: 'system/retention.chatMessageDays',
    fallback: 180,
    min: 1,
  }),
  rejectedCandidateDays: readInteger(retention.rejectedCandidateDays, {
    path: 'system/retention.rejectedCandidateDays',
    fallback: 180,
    min: 1,
  }),
  bannedCandidateDays: readInteger(retention.bannedCandidateDays, {
    path: 'system/retention.bannedCandidateDays',
    fallback: 730,
    min: 1,
  }),
  orphanFileHours: readInteger(retention.orphanFileHours, {
    path: 'system/retention.orphanFileHours',
    fallback: 24,
    min: 1,
  }),
  consentVersion: readInteger(retention.consentVersion, {
    path: 'system/retention.consentVersion',
    fallback: 1,
    min: 1,
  }),
}

/**
 * Request time limits
 * @type {{ readMs: number, writeMs: number, externalMs: number }}
 */

export const TIMEOUT_SETTINGS = {
  readMs: readInteger(timeouts.readMs, {
    path: 'system/timeouts.readMs',
    fallback: 20000,
    min: 1000,
  }),
  writeMs: readInteger(timeouts.writeMs, {
    path: 'system/timeouts.writeMs',
    fallback: 60000,
    min: 1000,
  }),
  externalMs: readInteger(timeouts.externalMs, {
    path: 'system/timeouts.externalMs',
    fallback: 10000,
    min: 1000,
  }),
} as const

/**
 * Client query cache
 * @type {{ staleMs: number, gcMs: number, readRetries: number, refreshMs: number }}
 */

export const CACHE_SETTINGS = {
  staleMs: readInteger(cache.staleMs, { path: 'system/cache.staleMs', fallback: 30000, min: 0 }),
  gcMs: readInteger(cache.gcMs, { path: 'system/cache.gcMs', fallback: 300000, min: 0 }),
  readRetries: readInteger(cache.readRetries, {
    path: 'system/cache.readRetries',
    fallback: 1,
    min: 0,
    max: 5,
  }),
  refreshMs: readInteger(cache.refreshMs, {
    path: 'system/cache.refreshMs',
    fallback: 30000,
    min: 0,
  }),
} as const

/**
 * Failures kept in the journal
 * @type {{ traceMaxLength: number, messageMaxLength: number, repeatWindowSeconds: number, repeatKeysMax: number }}
 */

export const FAILURE_SETTINGS = {
  traceMaxLength: readInteger(failures.traceMaxLength, {
    path: 'system/failures.traceMaxLength',
    fallback: 2000,
    min: 200,
  }),
  messageMaxLength: readInteger(failures.messageMaxLength, {
    path: 'system/failures.messageMaxLength',
    fallback: 300,
    min: 50,
  }),
  repeatWindowSeconds: readInteger(failures.repeatWindowSeconds, {
    path: 'system/failures.repeatWindowSeconds',
    fallback: 300,
    min: 10,
  }),
  repeatKeysMax: readInteger(failures.repeatKeysMax, {
    path: 'system/failures.repeatKeysMax',
    fallback: 200,
    min: 10,
  }),
}
