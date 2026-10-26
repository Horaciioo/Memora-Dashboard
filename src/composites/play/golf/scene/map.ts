import { compileHole } from '@/core/lib/play/golf'
import type { GolfHole, GolfHoleLayout, GolfPoint } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { map } = GOLF_SCENE

// Placed once per course
const placed = new WeakMap<GolfHoleLayout[], GolfPoint[]>()

/**
 * Two course rectangles closer than the gap
 * @param {GolfHole['bounds']} a - Rectangle
 * @param {GolfHole['bounds']} b - Rectangle
 * @return {boolean} - Too close
 */

const isCrowded = (a: GolfHole['bounds'], b: GolfHole['bounds']): boolean =>
  a.x0 < b.x1 + map.gap && b.x0 < a.x1 + map.gap && a.z0 < b.z1 + map.gap && b.z0 < a.z1 + map.gap

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
 * Middle of rectangles
 * @param {GolfHole['bounds'][]} rects - Rectangles
 * @return {GolfPoint} - Average centre
 */

const centreOf = (rects: GolfHole['bounds'][]): GolfPoint => [
  rects.reduce((sum, rect) => sum + (rect.x0 + rect.x1) / 2, 0) / rects.length,
  rects.reduce((sum, rect) => sum + (rect.z0 + rect.z1) / 2, 0) / rects.length,
]

/**
 * Spots of every hole of a course, packed round the middle, never overlapping
 * @param {GolfHoleLayout[]} layouts - Holes of the course
 * @return {GolfPoint[]} - Origin of each hole
 */

export const courseMap = (layouts: GolfHoleLayout[]): GolfPoint[] => {
  const known = placed.get(layouts)
  if (known) return known

  const holes = layouts.map((layout) => compileHole(layout))
  const origins: GolfPoint[] = [[0, 0]]
  const rects = [holes[0].bounds]

  holes.slice(1).forEach((hole) => {
    const [mx, mz] = centreOf(rects)
    const [hx, hz] = centreOf([hole.bounds])
    let origin: GolfPoint | null = null

    // Tightest free ring round the middle of the map
    for (let reach = 0; !origin && reach <= map.maxReach; reach += map.step) {
      origin =
        map.turns
          .map((turn): GolfPoint => {
            const angle = turn * (Math.PI / 180)
            return [mx + Math.sin(angle) * reach - hx, mz + Math.cos(angle) * reach - hz]
          })
          .find((spot) => !rects.some((other) => isCrowded(moved(hole.bounds, spot), other))) ??
        null
    }
    origin ??= [
      rects.reduce((right, rect) => Math.max(right, rect.x1), 0) + map.gap - hole.bounds.x0,
      0,
    ]
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
