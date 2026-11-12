// Random source, 0 to 1
export type SeededRng = () => number

/**
 * Seeded random source, the same seed always gives the same draws
 * @param {string} seed - Seed
 * @return {SeededRng} - Random source
 */

export const seededRng = (seed: string): SeededRng => {
  let state = 2166136261
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619)

  return () => {
    state = (state + 0x6d2b79f5) | 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}
