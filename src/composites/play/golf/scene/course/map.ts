import { compileHole } from '@/core/lib/play/golf'
import type { GolfHole, GolfHoleLayout, GolfPoint } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { map } = GOLF_SCENE

// Placed once per course
const placed = new WeakMap<GolfHoleLayout[], GolfPoint[]>()

/**
 * Two course rectangles closer than the chain gap
 * @param {GolfHole['bounds']} a - Rectangle
 * @param {GolfHole['bounds']} b - Rectangle
 * @return {boolean} - Too close
 */

const isCrowded = (a: GolfHole['bounds'], b: GolfHole['bounds']): boolean =>
  a.x0 < b.x1 + map.chainGap &&
  b.x0 < a.x1 + map.chainGap &&
  a.z0 < b.z1 + map.chainGap &&
  b.z0 < a.z1 + map.chainGap

/**
 * Rectangle moved to a spot
 * @param {GolfHole['bounds']} bounds - Local rectangle
 * @param {GolfPoint} origin - Spot
 * @return {GolfHole['bounds']} - Moved rectangle
 */

const moved = ({ x0, x1, z0, z1 }: GolfHole['bounds'], [ox, oz]: GolfPoint) => ({
  x0: x0 + ox,
  x1: x1 + ox,
  z0: z0 + oz,
  z1: z1 + oz,
})

/**
 * Spot of a hole whose tee lands closest to a cup, clear of the placed holes
 * @param {GolfHole} hole - Hole to place
 * @param {GolfPoint} cup - Previous cup, map spot
 * @param {GolfHole['bounds'][]} rects - Placed holes
 * @return {GolfPoint} - Origin of the hole
 */

const chainedOrigin = (
  hole: GolfHole,
  [cx, cz]: GolfPoint,
  rects: GolfHole['bounds'][]
): GolfPoint => {
  for (let reach = 0; reach <= map.maxReach; reach += map.step) {
    const spot = map.turns
      .map((turn): GolfPoint => {
        const angle = turn * (Math.PI / 180)
        return [
          cx + Math.sin(angle) * reach - hole.tee[0],
          cz + Math.cos(angle) * reach - hole.tee[1],
        ]
      })
      .find((origin) => !rects.some((other) => isCrowded(moved(hole.bounds, origin), other)))
    if (spot) return spot
  }

  return [rects.reduce((right, rect) => Math.max(right, rect.x1), 0) + map.gap - hole.bounds.x0, 0]
}

/**
 * Spots of every hole of a course, each tee right by the cup before it, never overlapping
 * @param {GolfHoleLayout[]} layouts - Holes of the course
 * @return {GolfPoint[]} - Origin of each hole
 */

export const courseMap = (layouts: GolfHoleLayout[]): GolfPoint[] => {
  const known = placed.get(layouts)
  if (known) return known

  const holes = layouts.map((layout) => compileHole(layout))
  const origins: GolfPoint[] = [[0, 0]]
  const rects = [holes[0].bounds]

  holes.slice(1).forEach((hole, index) => {
    const before = holes[index]
    const [ox, oz] = origins[index]
    const origin = chainedOrigin(hole, [ox + before.cup[0], oz + before.cup[1]], rects)
    origins.push(origin)
    rects.push(moved(hole.bounds, origin))
  })
  placed.set(layouts, origins)

  return origins
}

/**
 * Other holes of a map, placed around the played one
 * @param {GolfHoleLayout[]} layouts - Holes of the map
 * @param {number} index - Hole played
 * @return {{ rank: number, hole: GolfHole, at: GolfPoint }[]} - Holes and their offsets
 */

export const neighboursOf = (
  layouts: GolfHoleLayout[],
  index: number
): { rank: number; hole: GolfHole; at: GolfPoint }[] => {
  const origins = courseMap(layouts)
  const [ox, oz] = origins[index] ?? [0, 0]

  return layouts.flatMap((layout, rank) =>
    rank === index
      ? []
      : [{ rank, hole: compileHole(layout), at: [origins[rank][0] - ox, origins[rank][1] - oz] }]
  )
}

/**
 * Rectangles taken by the other holes, around the played one
 * @param {{ hole: GolfHole, at: GolfPoint }[]} neighbours - Placed holes
 * @return {GolfHole['bounds'][]} - Rectangles
 */

export const takenRects = (neighbours: { hole: GolfHole; at: GolfPoint }[]): GolfHole['bounds'][] =>
  neighbours.map(({ hole, at }) => moved(hole.bounds, at))
