/**
 * Colours each course draws with its own tokens
 * @type {readonly string[]}
 */

export const GOLF_COURSE_PAINT = ['turf', 'side', 'sky', 'horizon', 'mist', 'speck'] as const

/**
 * Colours shared by every course
 * @type {readonly string[]}
 */

export const GOLF_SHARED_PAINT = [
  'rail',
  'block',
  'sand',
  'ice',
  'boost',
  'water',
  'cup',
  'flag',
  'pole',
  'bumper',
  'spinner',
  'orb',
  'tornado',
  'aim-low',
  'aim-high',
  'place',
  'bad',
  'shade',
] as const

export type GolfPaintKey = (typeof GOLF_COURSE_PAINT)[number] | (typeof GOLF_SHARED_PAINT)[number]

// Shared token prefix
export const GOLF_PAINT_PREFIX = '--play-golf'
