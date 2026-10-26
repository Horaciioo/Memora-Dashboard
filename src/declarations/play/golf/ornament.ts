/**
 * Pixel squares around a block
 * @type {Object}
 */

export const GOLF_PIXEL_EDGE = {
  // Square step in rem
  unit: 0.5,
  // Squares per side, thickest on top
  counts: { top: 18, bottom: 8, left: 9, right: 9 },
  // Offset range in steps, negative sticks out
  reach: { min: -3, max: 1 },
  // Side length range in steps
  span: { min: 1, max: 2 },
  // Keeps a square off the corner
  margin: { min: 2, max: 97 },
  seed: 20261026,
} as const

/**
 * Twinkling stars around the trophy
 * @type {readonly { x: number; y: number; delay: string; scale: number }[]}
 */

export const GOLF_TROPHY_STARS = [
  { x: -6, y: 8, delay: '0s', scale: 1.1 },
  { x: 70, y: 4, delay: '0.6s', scale: 0.8 },
  { x: 74, y: 38, delay: '1.1s', scale: 1 },
  { x: -10, y: 42, delay: '0.3s', scale: 0.7 },
  { x: 32, y: -3, delay: '0.9s', scale: 0.9 },
] as const

/**
 * Squares thrown out by a holed ball
 * @type {Object}
 */

export const GOLF_CHEER = {
  sparks: 22,
  // Flight distance in rem
  reach: { min: 9, max: 19 },
  // Side length in rem
  size: { min: 0.45, max: 1.1 },
  // Latest start in ms
  delay: 260,
  seed: 20261027,
} as const
