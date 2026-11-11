/**
 * Integer hash of a lattice point, 0 to 1
 * @param {number} x - Column
 * @param {number} y - Row
 * @param {number} seed - Seed
 * @return {number} - Value
 */

const hashOf = (x: number, y: number, seed: number): number => {
  let mixed = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2147483647)
  mixed = Math.imul(mixed ^ (mixed >>> 13), 1274126177)

  return ((mixed ^ (mixed >>> 16)) >>> 0) / 4294967296
}

// Smooth step of the blend
const ease = (t: number): number => t * t * (3 - 2 * t)

/**
 * Smooth value noise, 0 to 1
 * @param {number} x - Column, any scale
 * @param {number} y - Row, any scale
 * @param {number} seed - Seed
 * @return {number} - Value
 */

export const valueNoise = (x: number, y: number, seed: number): number => {
  const cx = Math.floor(x)
  const cy = Math.floor(y)
  const tx = ease(x - cx)
  const ty = ease(y - cy)
  const top = hashOf(cx, cy, seed) + (hashOf(cx + 1, cy, seed) - hashOf(cx, cy, seed)) * tx
  const bottom =
    hashOf(cx, cy + 1, seed) + (hashOf(cx + 1, cy + 1, seed) - hashOf(cx, cy + 1, seed)) * tx

  return top + (bottom - top) * ty
}

/**
 * Layered noise, finer layers weaker, 0 to 1
 * @param {number} x - Column
 * @param {number} y - Row
 * @param {number} seed - Seed
 * @param {number} [octaves] - Layers
 * @return {number} - Value
 */

export const fbm = (x: number, y: number, seed: number, octaves = 4): number => {
  let sum = 0
  let weight = 0.5
  let total = 0
  let scale = 1
  for (let octave = 0; octave < octaves; octave += 1) {
    sum += valueNoise(x * scale, y * scale, seed + octave * 17) * weight
    total += weight
    weight *= 0.5
    scale *= 2.03
  }

  return sum / total
}

/**
 * Seeded random source for a decor piece
 * @param {number} seed - Seed
 * @return {() => number} - Random source, 0 to 1
 */

export const pieceRng = (seed: number): (() => number) => {
  let step = 0

  return () => {
    step += 1

    return hashOf(step, seed, 911)
  }
}
