import { arcRails, boosted, railBetween, slab } from '@/declarations/play/golf/courses/build'
import { cupField } from '@/declarations/play/golf/courses/randomtown/field'
import type { GolfHoleLayout, GolfPadLayout, GolfRailLayout } from '@/core/lib/play/golf/types'

// Disc radius, centre, total drop, depth where the floor meets the bins
const RADIUS = 9.2
const CENTRE_Z = 9
const DROP = 3.6
const BOTTOM = 17
// Strip depth, thinner where the wall closes in, so the floor follows the round wall
const ROW = 0.5
const FINE_FROM = 14
const FINE_ROW = 0.1
// Island splitting the two corridors
const ISLAND = { x0: -3.5, x1: 5, z0: 3, z1: 13 }

/**
 * Half width of the round floor at a depth
 * @param {number} z - Depth
 * @return {number} - Half width
 */

const half = (z: number): number => Math.sqrt(Math.max(0, RADIUS ** 2 - (z - CENTRE_Z) ** 2))

// Height of the disc at a depth
const heightAt = (z: number): number => DROP * (1 - z / BOTTOM)

/**
 * South edge of every strip
 * @return {number[]} - Depths
 */

const rows = (): number[] => [
  ...Array.from({ length: Math.round(FINE_FROM / ROW) }, (_, row) => row * ROW),
  ...Array.from(
    { length: Math.round((BOTTOM - FINE_FROM) / FINE_ROW) },
    (_, row) => Math.round((FINE_FROM + row * FINE_ROW) * 1000) / 1000
  ),
]

/**
 * Strips of the floor kept inside the wall, split in two corridors beside the island
 * @return {GolfPadLayout[]} - Slabs
 */

const strips = (): GolfPadLayout[] =>
  rows().flatMap((z): GolfPadLayout[] => {
    const depth = z < FINE_FROM ? ROW : FINE_ROW
    // Narrowest end, so the floor never pokes out of the wall
    const width = Math.min(half(z), half(z + depth))
    const slope = (x0: number, w: number, extra: Partial<GolfPadLayout> = {}) =>
      slab(x0, z, w, depth, heightAt(z), heightAt(z + depth), { open: 'news', ...extra })
    if (z < ISLAND.z0 || z >= ISLAND.z1) return [slope(-width, width * 2)]
    const isStart = z === ISLAND.z0
    const left = slope(-width, width + ISLAND.x0)
    const right = slope(ISLAND.x1, width - ISLAND.x1)

    return [isStart ? boosted(left, [0, 1]) : left, isStart ? boosted(right, [0, 1]) : right]
  })

/**
 * Round wall down to the bins, and the island walls
 * @return {GolfRailLayout[]} - Rails
 */

const walls = (): GolfRailLayout[] => {
  const angle = Math.acos((BOTTOM - CENTRE_Z) / RADIUS)
  const { x0, x1, z0, z1 } = ISLAND

  return [
    ...arcRails([0, CENTRE_Z], RADIUS, angle, Math.PI * 2 - angle, 40),
    railBetween([x0, z0], [x1, z0], [0, 1]),
    railBetween([x1, z0], [x1, z1], [-1, 0]),
    railBetween([x1, z1], [x0, z1], [0, -1]),
    railBetween([x0, z1], [x0, z0], [1, 0]),
  ]
}

/**
 * Le Disque: two corridors round an island, ending straight on the five bins
 * @return {GolfHoleLayout} - Hole
 */

export const discHole = (): GolfHoleLayout => {
  const field = cupField(BOTTOM)

  return {
    tee: [0, 1],
    cup: field.centre,
    cups: field.cups,
    pads: [...strips(), ...field.pads],
    rails: [...walls(), ...field.rails],
    bumpers: [
      { at: [-3, 14.2], radius: 0.35 },
      { at: [-1.2, 15.4], radius: 0.35 },
      { at: [-4.2, 15.6], radius: 0.35 },
    ],
    blocks: [
      { at: [2.4, 14], size: [0.25, 1.3] },
      { at: [3.9, 15.4], size: [0.25, 1.3] },
    ],
    orbs: [
      [-5.6, 7],
      [5.9, 8],
    ],
  }
}
