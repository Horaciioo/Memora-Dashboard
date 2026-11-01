/**
 * Session flag key
 * @type {string}
 */

export const SPLASH_STORAGE_KEY = 'memora.splash'

/**
 * Root attribute values
 * @type {Record<string, string>}
 */

export const SPLASH_FLAGS = {
  pending: 'pending',
  exit: 'exit',
} as const

/**
 * Splash timings
 * @type {Record<string, number>}
 */

export const SPLASH_TIMING = {
  // Intro length before the exit may start
  minMs: 2600,
  reducedMinMs: 300,
  // Longest wait on a slow load
  maxMs: 9000,
  // Page quiet before it counts as loaded
  settleMs: 250,
  exitMs: 2400,
} as const
