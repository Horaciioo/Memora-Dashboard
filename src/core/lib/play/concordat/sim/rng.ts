import type { ConcordatState } from '@/types/concordat'

/**
 * Next random number of the game, 0 to 1
 * @param {ConcordatState} state - Game
 * @return {number} - Random value
 */

export const nextRandom = (state: ConcordatState): number => {
  state.rng = (state.rng + 0x6d2b79f5) | 0
  let mixed = Math.imul(state.rng ^ (state.rng >>> 15), 1 | state.rng)
  mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed

  return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
}

/**
 * Stable pseudo-random value of a tile and tick
 * @param {number} tile - Tile
 * @param {number} tick - Tick
 * @return {number} - Value, 0 to 1
 */

export const tileNoise = (tile: number, tick: number): number => {
  const mixed = Math.imul(tile ^ Math.imul(tick, 2654435761), 2246822519)

  return ((mixed ^ (mixed >>> 15)) >>> 0) / 4294967296
}
