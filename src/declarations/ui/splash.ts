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
  exitMs: 2000,
} as const

/**
 * Bar steps while loading
 * @type {{ atMs: number, to: number }[]}
 */

export const SPLASH_PROGRESS = [
  { atMs: 400, to: 0.3 },
  { atMs: 1600, to: 0.55 },
  { atMs: 3400, to: 0.75 },
  { atMs: 6000, to: 0.88 },
] as const

/**
 * Colour of each letter
 * @type {string[]}
 */

export const SPLASH_LETTER_COLORS = [
  'var(--color-brand-600)',
  'var(--color-brand-500)',
  'var(--color-mauve-500)',
  'var(--color-mauve-600)',
  'var(--color-sky-500)',
  'var(--color-sky-400)',
] as const

/**
 * Hole of the e, in em of the letter box
 * @type {Record<string, number>}
 */

export const SPLASH_EYE = {
  // Letter holding the hole
  letter: 1,
  x: 0.3,
  y: 0.477,
  rx: 0.15,
  ry: 0.075,
  // Cut a little wider than the hole, the letter hides the surplus
  fit: 1.3,
} as const
