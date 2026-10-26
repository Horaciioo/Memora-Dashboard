/**
 * Colours each course draws with its own tokens
 * @type {readonly string[]}
 */

export const GOLF_COURSE_PAINT = [
  'turf',
  'side',
  'rock',
  'sky',
  'horizon',
  'mist',
  'speck',
  'leaf',
  'wall',
] as const

/**
 * Colours shared by every course
 * @type {readonly string[]}
 */

export const GOLF_SHARED_PAINT = [
  'trunk',
  'cloud',
  'block',
  'sign',
  'sign-frame',
  'sand',
  'ice',
  'boost',
  'water',
  'cup',
  'flag',
  'pole',
  'spinner',
  'tornado',
  'portal',
  'portal-exit',
  'vortex',
  'totem',
  'gust',
  'frost',
  'ice-deep',
  'ice-crack',
  'propeller',
  'propeller-edge',
  'dust',
  'funnel',
  'funnel-dark',
  'aim-low',
  'aim-mid',
  'aim-high',
  'place',
  'bad',
  'shade',
] as const

/**
 * Colours cut from the turf of a course, mixed toward a shared tone
 * @type {Record<string, { toward: string; amount: number }>}
 */

export const GOLF_TURF_PAINT = {
  obstacle: { toward: 'shade', amount: 0.22 },
  'obstacle-top': { toward: 'cloud', amount: 0.4 },
  bumper: { toward: 'cloud', amount: 0.22 },
} as const

export type GolfPaintKey =
  | (typeof GOLF_COURSE_PAINT)[number]
  | (typeof GOLF_SHARED_PAINT)[number]
  | keyof typeof GOLF_TURF_PAINT

// Shared token prefix
export const GOLF_PAINT_PREFIX = '--play-golf'

/**
 * HUD tones read from the tokens of a course
 * @param {string} coursePaint - Course token prefix
 * @return {Record<string, string>} - Custom properties
 */

export const golfHudTones = (coursePaint: string): Record<string, string> => ({
  '--play-golf-hud': `var(${coursePaint}-side)`,
  '--play-golf-hud-shadow': `var(${coursePaint}-turf)`,
  '--play-golf-hud-accent': `var(${coursePaint}-wall)`,
})
