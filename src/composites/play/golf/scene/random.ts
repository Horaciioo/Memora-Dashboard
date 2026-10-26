import type { GolfHole } from '@/core/lib/play/golf'

/**
 * Seeded random source, the same on every screen
 * @param {number} seed - Seed
 * @return {() => number} - Zero to one
 */

export const seededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Seed of a hole
 * @param {GolfHole} hole - Hole
 * @return {number} - Seed
 */

export const holeSeed = (hole: GolfHole): number =>
  Math.round((hole.cup[0] + 31) * 977 + (hole.cup[1] + 17) * 131)
