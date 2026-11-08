import type { GolfPadLayout, GolfPoint, GolfRailLayout } from '@/core/lib/play/golf/types'
import { GolfSurfaces } from '@/utils/constants/play'

/**
 * Slab running along z
 * @param {number} x0 - West edge
 * @param {number} z0 - South edge
 * @param {number} width - Along x
 * @param {number} depth - Along z
 * @param {number} [from] - Height at the south edge
 * @param {number} [to] - Height at the north edge, flat when omitted
 * @param {Partial<GolfPadLayout>} [extra] - Surface, push, edges
 * @return {GolfPadLayout} - Slab
 */

export const slab = (
  x0: number,
  z0: number,
  width: number,
  depth: number,
  from: number = 0,
  to: number = from,
  extra: Partial<GolfPadLayout> = {}
): GolfPadLayout => ({
  at: [x0, z0],
  size: [width, depth],
  height: from,
  ...(to === from ? {} : { rise: { axis: 'z' as const, to } }),
  ...extra,
})

/**
 * Boost slab pushing along a direction
 * @param {GolfPadLayout} pad - Slab
 * @param {GolfPoint} push - Direction
 * @return {GolfPadLayout} - Boost slab
 */

export const boosted = (pad: GolfPadLayout, push: GolfPoint): GolfPadLayout => {
  const length = Math.hypot(push[0], push[1]) || 1

  return {
    ...pad,
    surface: GolfSurfaces.Boost,
    push: [push[0] / length, push[1] / length],
  }
}

/**
 * Rails along an arc
 * @param {GolfPoint} centre - Circle centre
 * @param {number} radius - Radius
 * @param {number} from - Start angle
 * @param {number} to - End angle
 * @param {number} steps - Segments
 * @param {boolean} [isGlass] - Glass wall
 * @return {GolfRailLayout[]} - Rails
 */

export const arcRails = (
  [cx, cz]: GolfPoint,
  radius: number,
  from: number,
  to: number,
  steps: number,
  isGlass = false
): GolfRailLayout[] =>
  Array.from({ length: steps }, (_, index) => {
    const a = from + ((to - from) * index) / steps
    const b = from + ((to - from) * (index + 1)) / steps
    const mid = (a + b) / 2

    return {
      from: [cx + Math.sin(a) * radius, cz + Math.cos(a) * radius],
      to: [cx + Math.sin(b) * radius, cz + Math.cos(b) * radius],
      out: [Math.sin(mid), Math.cos(mid)],
      ...(isGlass ? { isGlass } : {}),
    }
  })

/**
 * Straight rail
 * @param {GolfPoint} from - Start
 * @param {GolfPoint} to - End
 * @param {GolfPoint} out - Side away from the floor
 * @return {GolfRailLayout} - Rail
 */

export const railBetween = (from: GolfPoint, to: GolfPoint, out: GolfPoint): GolfRailLayout => ({
  from,
  to,
  out,
})

/**
 * Slab running along x
 * @param {number} x0 - West edge
 * @param {number} z0 - South edge
 * @param {number} width - Along x
 * @param {number} depth - Along z
 * @param {number} [from] - Height at the west edge
 * @param {number} [to] - Height at the east edge, flat when omitted
 * @param {Partial<GolfPadLayout>} [extra] - Surface, push, edges
 * @return {GolfPadLayout} - Slab
 */

export const slabX = (
  x0: number,
  z0: number,
  width: number,
  depth: number,
  from: number = 0,
  to: number = from,
  extra: Partial<GolfPadLayout> = {}
): GolfPadLayout => ({
  at: [x0, z0],
  size: [width, depth],
  height: from,
  ...(to === from ? {} : { rise: { axis: 'x' as const, to } }),
  ...extra,
})

/**
 * Cushion rail
 * @param {GolfPoint} from - Start
 * @param {GolfPoint} to - End
 * @param {GolfPoint} out - Side away from the floor
 * @return {GolfRailLayout} - Rail
 */

export const cushion = (from: GolfPoint, to: GolfPoint, out: GolfPoint): GolfRailLayout => ({
  from,
  to,
  out,
  isBouncy: true,
})

/**
 * Rail closing a bay behind a hole
 * @param {GolfPoint} from - Start
 * @param {GolfPoint} to - End
 * @param {GolfPoint} out - Side away from the floor
 * @return {GolfRailLayout} - Rail
 */

export const pane = (from: GolfPoint, to: GolfPoint, out: GolfPoint): GolfRailLayout => ({
  from,
  to,
  out,
  isGlass: true,
})

/**
 * Options of a track
 * @typedef {Object} TrackOptions
 * @property {number} [plate] - Length of the boost laid at the start of each leg listed in plates
 * @property {number[]} [plates] - Legs starting with a boost
 * @property {number[]} [bouncy] - Corners (waypoint indexes) with a cushion bevel
 * @property {number[]} [square] - Corners left square, no bevel
 * @property {Record<number, Partial<GolfPadLayout>>} [legs] - Extra of a leg
 */

export interface TrackOptions {
  plate?: number
  plates?: number[]
  bouncy?: number[]
  square?: number[]
  legs?: Record<number, Partial<GolfPadLayout>>
}

/**
 * Unit direction between two waypoints
 * @param {GolfPoint} from - Start
 * @param {GolfPoint} to - End
 * @return {GolfPoint} - Direction
 */

const heading = (from: GolfPoint, to: GolfPoint): GolfPoint => [
  Math.sign(to[0] - from[0]),
  Math.sign(to[1] - from[1]),
]

/**
 * Leg slab between two squares, tilted along its axis
 * @param {GolfPoint} start - Start of the leg
 * @param {GolfPoint} dir - Direction
 * @param {number} length - Length
 * @param {number} width - Width
 * @param {[number, number]} heights - Heights at the start and at the end
 * @param {Partial<GolfPadLayout>} extra - Extra of the slab
 * @return {GolfPadLayout} - Slab
 */

const leg = (
  start: GolfPoint,
  dir: GolfPoint,
  length: number,
  width: number,
  [from, to]: [number, number],
  extra: Partial<GolfPadLayout>
): GolfPadLayout => {
  const half = width / 2
  if (dir[0] === 0) {
    const z0 = dir[1] > 0 ? start[1] : start[1] - length

    return slab(
      start[0] - half,
      z0,
      width,
      length,
      dir[1] > 0 ? from : to,
      dir[1] > 0 ? to : from,
      extra
    )
  }
  const x0 = dir[0] > 0 ? start[0] : start[0] - length

  return slabX(
    x0,
    start[1] - half,
    length,
    width,
    dir[0] > 0 ? from : to,
    dir[0] > 0 ? to : from,
    extra
  )
}

/**
 * Corridor of flat squares at the waypoints joined by tilted legs
 * @param {GolfPoint[]} points - Waypoints, each leg along an axis
 * @param {number} width - Corridor width
 * @param {number[]} heights - Floor height at each waypoint
 * @param {TrackOptions} [options] - Boosts, cushions, extras
 * @return {{ pads: GolfPadLayout[], rails: GolfRailLayout[] }} - Slabs and walls
 */

export const track = (
  points: GolfPoint[],
  width: number,
  heights: number[],
  options: TrackOptions = {}
): { pads: GolfPadLayout[]; rails: GolfRailLayout[] } => {
  const half = width / 2
  const pads: GolfPadLayout[] = points.map(([x, z], index) =>
    slab(x - half, z - half, width, width, heights[index])
  )
  const rails: GolfRailLayout[] = []

  for (let index = 0; index < points.length - 1; index += 1) {
    const dir = heading(points[index], points[index + 1])
    const total =
      Math.abs(points[index + 1][0] - points[index][0]) +
      Math.abs(points[index + 1][1] - points[index][1])
    const length = total - width
    if (length <= 1e-6) continue
    const start: GolfPoint = [points[index][0] + dir[0] * half, points[index][1] + dir[1] * half]
    const [h0, h1] = [heights[index], heights[index + 1]]
    const extra = options.legs?.[index] ?? {}
    const plate = options.plates?.includes(index) ? Math.min(options.plate ?? 2, length) : 0
    if (!plate) {
      pads.push(leg(start, dir, length, width, [h0, h1], extra))
      continue
    }
    // Boost at the start, the rest follows the slope
    const split = h0 + ((h1 - h0) * plate) / length
    const next: GolfPoint = [start[0] + dir[0] * plate, start[1] + dir[1] * plate]
    pads.push(boosted(leg(start, dir, plate, width, [h0, split], extra), dir))
    if (length - plate > 1e-6) pads.push(leg(next, dir, length - plate, width, [split, h1], extra))
  }

  for (let index = 1; index < points.length - 1; index += 1) {
    if (options.square?.includes(index)) continue
    const din = heading(points[index - 1], points[index])
    const dout = heading(points[index], points[index + 1])
    const [cx, cz] = points[index]
    const corner = (a: number, b: number): GolfPoint => [
      cx + (din[0] * a + dout[0] * b) * half,
      cz + (din[1] * a + dout[1] * b) * half,
    ]
    const inside = corner(-1, 1)
    const outside = corner(1, -1)
    rails.push({
      from: corner(1, 1),
      to: corner(-1, -1),
      out: [outside[0] - inside[0], outside[1] - inside[1]],
      ...(options.bouncy?.includes(index) ? { isBouncy: true } : {}),
    })
  }

  return { pads, rails }
}

/**
 * Valley across z
 * @param {number} x0 - West edge
 * @param {number} z0 - South edge
 * @param {number} width - Along x
 * @param {number} depth - Along z, both slopes
 * @param {number} sink - Height lost down the valley
 * @param {Partial<GolfPadLayout>} [extra] - Surface, edges
 * @return {GolfPadLayout[]} - Two slabs
 */

export const valley = (
  x0: number,
  z0: number,
  width: number,
  depth: number,
  sink: number,
  extra: Partial<GolfPadLayout> = {}
): GolfPadLayout[] => [
  slab(x0, z0, width, depth / 2, 0, -sink, extra),
  slab(x0, z0 + depth / 2, width, depth / 2, -sink, 0, { ...extra, open: undefined }),
]

// Unit direction of a diagonal
const SQRT_HALF = Math.SQRT1_2

/**
 * Mirror cutting a corner
 * @param {GolfPoint} centre - Middle of the corner box
 * @param {number} half - Half side of the box
 * @param {1 | -1} slope - Diagonal rising (1) or falling (-1) along x
 * @param {1 | -1} side - Side of the diagonal holding the floor
 * @return {GolfRailLayout} - Rail
 */

export const mirror = (
  [cx, cz]: GolfPoint,
  half: number,
  slope: 1 | -1,
  side: 1 | -1
): GolfRailLayout => ({
  from: [cx - half, cz - half * slope],
  to: [cx + half, cz + half * slope],
  out: [-side * SQRT_HALF * slope, side * SQRT_HALF],
})
