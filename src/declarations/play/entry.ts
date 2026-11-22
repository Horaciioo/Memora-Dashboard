/**
 * Entry screen timings
 * @type {Record<string, number>}
 */

export const PLAY_ENTRY_TIMING = {
  totalMs: 3100,
  reducedMs: 400,
} as const

// Staggers of a square, in milliseconds: column step, jitter step and range of each, out step
export const PLAY_ENTRY_STAGGER = {
  column: 34,
  inJitter: 38,
  inRange: 9,
  outStep: 36,
  outRange: 10,
  // Flight of a square when it pops away, in squares either side
  spread: 3,
  spreadRange: 7,
} as const

// Word under the brain
export const PLAY_ENTRY_WORD = 'PLAY'

// Squares of the loading bar
export const PLAY_ENTRY_BAR = 12

/**
 * Entry screen classes
 * @type {Record<string, string>}
 */

export const PLAY_ENTRY = {
  overlay: 'play-entry cursor-pointer select-none',
  stage: 'play-entry-stage',
  pixel: 'play-entry-pixel',
  bar: 'play-entry-bar',
  cell: 'play-entry-cell',
} as const
