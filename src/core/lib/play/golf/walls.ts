import { padHeight } from '@/core/lib/play/golf/terrain'
import type { GolfEdge, GolfPad, GolfPadLayout, GolfWall } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

// Touch tolerance
const EPSILON = 1e-4

// Span along an edge
type Span = [number, number]

/**
 * One side of a slab
 * @typedef {Object} PadSide
 */

interface PadSide {
  // Fixed coordinate, x for e and w, z for n and s
  line: number
  span: Span
  // Point of the side at a position along it
  point: (along: number) => [number, number]
  // Neighbour touching this side, its span
  facing: (other: GolfPad) => Span | null
  // Outward direction
  normal: [number, number]
}

/**
 * Side geometry of a slab
 * @param {GolfPad} pad - Slab
 * @param {GolfEdge} edge - Side
 * @return {PadSide} - Geometry
 */

const sideOf = (pad: GolfPad, edge: GolfEdge): PadSide => {
  const isNorthSouth = edge === 'n' || edge === 's'
  const line = { n: pad.z1, s: pad.z0, e: pad.x1, w: pad.x0 }[edge]
  const span: Span = isNorthSouth ? [pad.x0, pad.x1] : [pad.z0, pad.z1]
  // The neighbour's matching side
  const across = (other: GolfPad) => ({ n: other.z0, s: other.z1, e: other.x0, w: other.x1 })[edge]

  return {
    line,
    span,
    normal: { n: [0, 1], s: [0, -1], e: [1, 0], w: [-1, 0] }[edge] as [number, number],
    point: (along) => (isNorthSouth ? [along, line] : [line, along]),
    facing: (other) => {
      if (Math.abs(across(other) - line) > EPSILON) return null
      const theirs = isNorthSouth ? [other.x0, other.x1] : [other.z0, other.z1]
      const from = Math.max(span[0], theirs[0])
      const to = Math.min(span[1], theirs[1])

      return to - from > EPSILON ? [from, to] : null
    },
  }
}

/**
 * Spans left once others are cut out
 * @param {Span[]} spans - Kept spans
 * @param {Span} cut - Removed span
 * @return {Span[]} - Spans left
 */

const cutSpan = (spans: Span[], [from, to]: Span): Span[] =>
  spans.flatMap(([start, end]): Span[] =>
    [[start, Math.min(end, from)] as Span, [Math.max(start, to), end] as Span].filter(
      ([left, right]) => right - left > EPSILON
    )
  )

/**
 * Wall along part of a side
 * @param {GolfPad} pad - Slab guarded
 * @param {PadSide} side - Side
 * @param {Span} span - Part of the side
 * @param {number | null} cliff - Height of the slab above, rail when null
 * @return {GolfWall} - Wall
 */

const wallOn = (pad: GolfPad, side: PadSide, [from, to]: Span, cliff: number | null): GolfWall => {
  const [ax, az] = side.point(from)
  const [bx, bz] = side.point(to)

  return {
    ax,
    az,
    bx,
    bz,
    fa: padHeight(pad, ax, az),
    fb: padHeight(pad, bx, bz),
    top: cliff ?? GOLF_SETTINGS.render.railHeight,
    kind: cliff === null ? 'rail' : 'cliff',
    nx: side.normal[0],
    nz: side.normal[1],
  }
}

/**
 * Walls of one side: rails where nothing touches, cliffs under higher slabs
 * @param {GolfPad[]} pads - Every slab
 * @param {number} index - Slab guarded
 * @param {GolfEdge} edge - Side
 * @param {boolean} isOpen - No rail drawn
 * @return {GolfWall[]} - Walls
 */

const sideWalls = (pads: GolfPad[], index: number, edge: GolfEdge, isOpen: boolean) => {
  const pad = pads[index]
  const side = sideOf(pad, edge)
  let free: Span[] = [side.span]
  const cliffs: GolfWall[] = []

  // Neighbours cut the rail, higher ones raise a cliff
  pads.forEach((other, otherIndex) => {
    const span = otherIndex === index ? null : side.facing(other)
    if (!span) return
    free = cutSpan(free, span)
    const [x, z] = side.point((span[0] + span[1]) / 2)
    const rise = padHeight(other, x, z) - padHeight(pad, x, z)
    if (rise > GOLF_SETTINGS.physics.stepUp) cliffs.push(wallOn(pad, side, span, rise))
  })

  return [...(isOpen ? [] : free.map((span) => wallOn(pad, side, span, null))), ...cliffs]
}

/**
 * Every rail and cliff of a hole
 * @param {GolfPadLayout[]} layouts - Drawn slabs
 * @param {GolfPad[]} pads - Compiled slabs
 * @return {GolfWall[]} - Walls
 */

export const edgeWalls = (layouts: GolfPadLayout[], pads: GolfPad[]): GolfWall[] =>
  pads.flatMap((_, index) =>
    (['n', 'e', 's', 'w'] as const).flatMap((edge) =>
      sideWalls(pads, index, edge, Boolean(layouts[index].open?.includes(edge)))
    )
  )
