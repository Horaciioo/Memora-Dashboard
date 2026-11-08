import { arcRails, boosted, railBetween, slab } from '@/declarations/play/golf/courses/build'
import { cupField } from '@/declarations/play/golf/courses/randomtown/field'
import type { GolfHoleLayout, GolfPadLayout, GolfRailLayout } from '@/core/lib/play/golf/types'

// Disc radius, centre, total drop
const RADIUS = 9
const CENTRE_Z = 9
const DROP = 3.6
// Where the round wall turns into the funnel
const FUNNEL_FROM = 14.5
const MOUTH = 4.5
const BOTTOM = 18
// Island splitting the two corridors
const ISLAND = { x0: -3.5, x1: 5, z0: 3, z1: 13 }

/**
 * Half width of the floor at a depth, round then funnel
 * @param {number} z - Depth
 * @return {number} - Half width
 */

const half = (z: number): number => {
  if (z <= FUNNEL_FROM) return Math.sqrt(RADIUS ** 2 - (z - CENTRE_Z) ** 2)
  const edge = Math.sqrt(RADIUS ** 2 - (FUNNEL_FROM - CENTRE_Z) ** 2)

  return edge - ((z - FUNNEL_FROM) * (edge - MOUTH)) / (BOTTOM - FUNNEL_FROM)
}

// Height of the disc at a depth
const heightAt = (z: number): number => DROP * (1 - z / BOTTOM)

/**
 * Strips of the floor, split in two corridors beside the island
 * @return {GolfPadLayout[]} - Slabs
 */

const strips = (): GolfPadLayout[] =>
  Array.from({ length: BOTTOM }, (_, row): GolfPadLayout[] => {
    const z = row
    const width = Math.max(half(z), half(z + 1)) + 0.15
    const common = { open: 'news' }
    const slope = (x0: number, w: number, extra: Partial<GolfPadLayout> = {}) =>
      slab(x0, z, w, 1, heightAt(z), heightAt(z + 1), { ...common, ...extra })
    if (z < ISLAND.z0 || z >= ISLAND.z1) return [slope(-width, width * 2)]
    const isStart = z === ISLAND.z0
    const left = slope(-width, width + ISLAND.x0)
    const right = slope(ISLAND.x1, width - ISLAND.x1)

    return [isStart ? boosted(left, [0, 1]) : left, isStart ? boosted(right, [0, 1]) : right]
  }).flat()

/**
 * Round wall, island and funnel walls
 * @return {GolfRailLayout[]} - Rails
 */

const walls = (): GolfRailLayout[] => {
  const edge = half(FUNNEL_FROM)
  const angle = Math.atan2(edge, FUNNEL_FROM - CENTRE_Z)
  const { x0, x1, z0, z1 } = ISLAND

  return [
    ...arcRails([0, CENTRE_Z], RADIUS, angle, Math.PI * 2 - angle, 36),
    railBetween([-edge, FUNNEL_FROM], [-MOUTH, BOTTOM], [-1, 0]),
    railBetween([edge, FUNNEL_FROM], [MOUTH, BOTTOM], [1, 0]),
    railBetween([x0, z0], [x1, z0], [0, 1]),
    railBetween([x1, z0], [x1, z1], [-1, 0]),
    railBetween([x1, z1], [x0, z1], [0, -1]),
    railBetween([x0, z1], [x0, z0], [1, 0]),
  ]
}

/**
 * Le Disque: two corridors round an island, a funnel, then the five holes
 * @return {GolfHoleLayout} - Hole
 */

export const discHole = (): GolfHoleLayout => {
  const field = cupField(BOTTOM)

  return {
    tee: [0, 1],
    cup: field.centre,
    cups: field.cups,
    pads: [...strips(), ...field.pads],
    rails: walls(),
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
