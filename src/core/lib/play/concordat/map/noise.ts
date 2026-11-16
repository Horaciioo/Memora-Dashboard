// Integer lattice hash, 0 to 1
const hashAt = (seed: number, x: number, y: number): number => {
  let value = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed, 1597334677)
  value = Math.imul(value ^ (value >>> 13), 1274126177)

  return ((value ^ (value >>> 16)) >>> 0) / 4294967296
}

const smooth = (t: number): number => t * t * (3 - 2 * t)

// Smooth value noise, 0 to 1
const valueNoise = (seed: number, x: number, y: number): number => {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const tx = smooth(x - x0)
  const ty = smooth(y - y0)
  const top = hashAt(seed, x0, y0) * (1 - tx) + hashAt(seed, x0 + 1, y0) * tx
  const bottom = hashAt(seed, x0, y0 + 1) * (1 - tx) + hashAt(seed, x0 + 1, y0 + 1) * tx

  return top * (1 - ty) + bottom * ty
}

/**
 * Layered noise, 0 to 1
 * @param {number} seed - Noise seed
 * @param {number} x - Horizontal position
 * @param {number} y - Vertical position
 * @param {number} octaves - Layer count
 * @return {number} - Noise value
 */

export const fractalNoise = (seed: number, x: number, y: number, octaves: number): number => {
  let sum = 0
  let weight = 0
  let amplitude = 1
  let frequency = 1

  // One layer per octave
  for (let octave = 0; octave < octaves; octave++) {
    sum += valueNoise(seed + octave * 101, x * frequency, y * frequency) * amplitude
    weight += amplitude
    amplitude *= 0.5
    frequency *= 2
  }

  return sum / weight
}
