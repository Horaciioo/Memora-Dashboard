import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import type { NavalBurst } from '@/declarations/play/naval/choreographies'
import { NAVAL_WATER } from '@/declarations/play/naval/skins'

/**
 * Kinds of particle, stored as numbers
 * @type {Record<string, number>}
 */

export const ParticleKinds = { Spray: 0, Spark: 1, Debris: 2, Smoke: 3, Bubble: 4 } as const

type ParticleKind = (typeof ParticleKinds)[keyof typeof ParticleKinds]

// Slots per particle: x y z vx vy vz age life size kind
const STRIDE = 10
// Pull on falling bits, squares per second squared
const GRAVITY = 9
// Life of each kind, in milliseconds
const LIFE_MS: Record<ParticleKind, number> = [700, 520, 1100, 2200, 1400]
const COLOUR: Record<ParticleKind, string> = [
  NAVAL_WATER.foam,
  NAVAL_WATER.fire,
  NAVAL_WATER.plane,
  NAVAL_WATER.smoke,
  NAVAL_WATER.wake,
]

/**
 * Fixed reserve of particles, oldest recycled
 * @typedef {Object} ParticlePool
 */

export interface ParticlePool {
  data: Float32Array
  capacity: number
  next: number
  live: number
}

/**
 * Reserve sized by the tier
 * @param {number} capacity - Particles
 * @return {ParticlePool} - Empty pool
 */

export const createParticles = (capacity: number): ParticlePool => ({
  data: new Float32Array(Math.max(1, capacity) * STRIDE),
  capacity: Math.max(1, capacity),
  next: 0,
  live: 0,
})

/**
 * Launch speed of a kind, squares per second
 * @param {ParticleKind} kind - Kind
 * @param {number} power - Strength
 * @return {number[]} - Ground and lift speed
 */

const speedOf = (kind: ParticleKind, power: number): [number, number] => {
  const ground = (0.4 + Math.random()) * power
  if (kind === ParticleKinds.Smoke) return [ground * 0.25, 0.5 + Math.random() * 0.4]
  if (kind === ParticleKinds.Bubble) return [ground * 0.1, 0.15]

  return [ground * (kind === ParticleKinds.Spray ? 0.6 : 1.2), (1.5 + Math.random() * 2.5) * power]
}

/**
 * Throw particles of one kind from a square point
 * @param {ParticlePool} pool - Pool
 * @param {ParticleKind} kind - Kind
 * @param {{ x: number; y: number; count: number; power?: number }} burst - Where and how many
 * @return {void}
 */

export const emit = (
  pool: ParticlePool,
  kind: ParticleKind,
  { x, y, count, power = 1 }: { x: number; y: number; count: number; power?: number }
): void => {
  const { data } = pool
  for (let index = 0; index < count; index += 1) {
    const at = pool.next * STRIDE
    const angle = Math.random() * Math.PI * 2
    const [ground, lift] = speedOf(kind, power)
    data.set([x, y, 0, Math.cos(angle) * ground, Math.sin(angle) * ground * 0.6, lift, 0], at)
    data[at + 7] = LIFE_MS[kind] * (0.7 + Math.random() * 0.6)
    data[at + 8] = 0.05 + Math.random() * 0.06
    data[at + 9] = kind
    pool.next = (pool.next + 1) % pool.capacity
  }
}

/**
 * Throw a whole burst, scaled by the take
 * @param {ParticlePool} pool - Pool
 * @param {NavalBurst} burst - Counts
 * @param {{ x: number; y: number; scale: number }} at - Square point
 * @return {void}
 */

export const emitBurst = (
  pool: ParticlePool,
  burst: NavalBurst,
  { x, y, scale }: { x: number; y: number; scale: number }
): void => {
  const count = (value: number) => Math.round(value * scale)
  emit(pool, ParticleKinds.Spray, { x, y, count: count(burst.spray) })
  emit(pool, ParticleKinds.Spark, { x, y, count: count(burst.spark), power: 1.3 })
  emit(pool, ParticleKinds.Debris, { x, y, count: count(burst.debris) })
  emit(pool, ParticleKinds.Smoke, { x, y, count: count(burst.smoke) })
}

/**
 * Advance every particle
 * @param {ParticlePool} pool - Pool
 * @param {number} ms - Time since the last step
 * @return {void}
 */

export const stepParticles = (pool: ParticlePool, ms: number): void => {
  const { data } = pool
  const seconds = Math.min(ms, 100) / 1000
  let live = 0
  for (let at = 0; at < data.length; at += STRIDE) {
    if (data[at + 6] >= data[at + 7]) continue
    live += 1
    data[at + 6] += seconds * 1000
    data[at] += data[at + 3] * seconds
    data[at + 1] += data[at + 4] * seconds
    // Smoke and bubbles float, the rest falls back
    const isFloating = data[at + 9] >= ParticleKinds.Smoke
    data[at + 5] -= isFloating ? 0 : GRAVITY * seconds
    data[at + 2] = Math.max(0, data[at + 2] + data[at + 5] * seconds)
    if (!isFloating && data[at + 2] === 0 && data[at + 5] < 0) data[at + 6] = data[at + 7]
  }
  pool.live = live
}

/**
 * Paint the live particles in sight
 * @param {OceanFrame} frame - Frame
 * @param {ParticlePool} pool - Pool
 * @return {void}
 */

export const paintParticles = (frame: OceanFrame, pool: ParticlePool): void => {
  if (!pool.live) return
  const { ctx, cell, left, top, width } = frame
  const { data } = pool
  for (let at = 0; at < data.length; at += STRIDE) {
    const age = data[at + 6] / data[at + 7]
    if (age >= 1) continue
    const kind = data[at + 9] as ParticleKind
    const x = left + data[at] * cell
    const y = top + (data[at + 1] - data[at + 2]) * cell
    if (x < -cell || y < -cell || x > width + cell || y > width + cell) continue
    const isPuff = kind >= ParticleKinds.Smoke
    const size = data[at + 8] * cell * (isPuff ? 2 + age * 4 : 1)
    ctx.globalAlpha = (1 - age) * (isPuff ? 0.6 : 1)
    ctx.fillStyle = COLOUR[kind]
    ctx.fillRect(x - size / 2, y - size / 2, size, size)
  }
  ctx.globalAlpha = 1
}
