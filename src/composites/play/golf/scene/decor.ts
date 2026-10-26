import { holeSeed, seededRandom } from '@/composites/play/golf/scene/random'
import { overviewOf } from '@/composites/play/golf/scene/rig'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { clouds, blocks } = GOLF_SCENE

// Spot in the sky, metres
type Spot = [number, number, number]

/**
 * Puffy cloud, a few round lumps
 * @typedef {Object} GolfCloud
 */

export interface GolfCloud {
  at: Spot
  lumps: { at: Spot; size: number }[]
}

/**
 * Plain straight block butted against one edge of the course, axis aligned
 * @typedef {Object} GolfBlock
 */

export interface GolfBlock {
  // Foot of the block, on the ground
  at: Spot
  width: number
  depth: number
  height: number
  // Picks a paint tone, not a rotation: blocks stay axis aligned
  tone: number
}

/**
 * Point on a ring around the course
 * @param {() => number} random - Random source
 * @param {Object} ring - Ring
 * @param {number} ring.reach - Course reach
 * @param {number} ring.near - Inner factor
 * @param {number} ring.far - Outer factor
 * @param {number} index - Rank on the ring
 * @return {[number, number]} - Offset x z
 */

const ringPoint = (
  random: () => number,
  { reach, near, far }: { reach: number; near: number; far: number },
  index: number
): [number, number] => {
  // Golden angle, even spread
  const angle = index * 2.39996 + random() * 0.6
  const distance = reach * (near + random() * (far - near))

  return [Math.cos(angle) * distance, Math.sin(angle) * distance]
}

/**
 * Block butted against one side of the course rectangle, foot on the ground
 * @param {() => number} random - Random source
 * @param {GolfHole['bounds']} bounds - Course rectangle
 * @param {number} edge - Which side, 0 to 3 going round
 * @return {GolfBlock} - Block, flush against that edge
 */

const edgeBlock = (random: () => number, bounds: GolfHole['bounds'], edge: number): GolfBlock => {
  const span = (min: number, max: number) => min + random() * (max - min)
  const width = span(blocks.minSize, blocks.maxSize)
  const depth = span(blocks.minSize, blocks.maxSize)
  const height = span(blocks.minHeight, blocks.maxHeight)
  // Sunk in, so its face meets the course wall with no gap
  const sink = blocks.overlap
  const alongX = bounds.x0 + span(0, bounds.x1 - bounds.x0)
  const alongZ = bounds.z0 + span(0, bounds.z1 - bounds.z0)

  const sides: Spot[] = [
    [alongX, 0, bounds.z0 - depth / 2 + sink],
    [bounds.x1 + width / 2 - sink, 0, alongZ],
    [alongX, 0, bounds.z1 + depth / 2 - sink],
    [bounds.x0 - width / 2 + sink, 0, alongZ],
  ]

  return { at: sides[edge % 4], width, depth, height, tone: Math.floor(random() * blocks.tones) }
}

/**
 * Block standing over a rectangle
 * @param {GolfBlock} block - Block
 * @param {GolfHole['bounds']} rect - Rectangle
 * @return {boolean} - Overlaps
 */

const isUnder = ({ at: [x, , z], width, depth }: GolfBlock, rect: GolfHole['bounds']): boolean =>
  Math.abs(x - (rect.x0 + rect.x1) / 2) < (width + rect.x1 - rect.x0) / 2 &&
  Math.abs(z - (rect.z0 + rect.z1) / 2) < (depth + rect.z1 - rect.z0) / 2

/**
 * Clouds and plain blocks around a hole, the same on every screen
 * @param {GolfHole} hole - Hole
 * @param {GolfHole['bounds'][]} taken - Other holes around, kept clear
 * @return {{ center: Spot, clouds: GolfCloud[], blocks: GolfBlock[] }} - Scenery
 */

export const sceneryOf = (
  hole: GolfHole,
  taken: GolfHole['bounds'][]
): { center: Spot; clouds: GolfCloud[]; blocks: GolfBlock[] } => {
  const random = seededRandom(holeSeed(hole))
  const { center, reach } = overviewOf(hole)
  const span = (min: number, max: number) => min + random() * (max - min)

  return {
    center: [center.x, 0, center.z],
    clouds: Array.from({ length: clouds.count }, (_, index) => {
      const [x, z] = ringPoint(random, { reach, near: clouds.near, far: clouds.far }, index)
      return {
        // Around the centre, it turns there
        at: [x, span(clouds.low, clouds.high), z],
        lumps: Array.from(
          { length: Math.round(span(clouds.minLumps, clouds.maxLumps)) },
          (_, lump) => ({
            at: [(lump - 1.5) * clouds.gap, random() * clouds.rise, (random() - 0.5) * clouds.gap],
            size: span(clouds.minSize, clouds.maxSize),
          })
        ),
      }
    }),
    // Most holes get none at all, at most one when they do
    blocks: (random() < blocks.chance
      ? [edgeBlock(random, hole.bounds, Math.floor(random() * 4))]
      : []
    )
      .filter((block) => !taken.some((rect) => isUnder(block, rect)))
      .filter((block) => !hole.pads.some((pad) => isUnder(block, pad))),
  }
}
