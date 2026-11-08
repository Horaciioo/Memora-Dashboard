import { BufferGeometry, Float32BufferAttribute } from 'three'

import { railEnds } from '@/composites/play/golf/scene/course/railEnds'
import { floorHeight } from '@/core/lib/play/golf'
import type { GolfHole, GolfPad, GolfWall } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfSurfaces } from '@/utils/constants/play'

const { render } = GOLF_SETTINGS
const { edge } = GOLF_SCENE

/**
 * Straight line on the ground, outward normal
 * @typedef {Object} GolfEdgeLine
 */

export interface GolfEdgeLine {
  ax: number
  az: number
  bx: number
  bz: number
  nx: number
  nz: number
}

/**
 * Rounded top of a rail, end to end
 * @typedef {Object} GolfRailCap
 */

export interface GolfRailCap {
  a: [number, number, number]
  b: [number, number, number]
  // Rounded ends, cut ends stay flat
  knobs: [number, number, number][]
}

/**
 * Rounded caps over every rail, their top at the rail height
 * @param {GolfHole} hole - Hole
 * @return {GolfRailCap[]} - Caps
 */

export const railCaps = (hole: GolfHole): GolfRailCap[] => {
  const half = render.railWidth / 2

  return hole.walls
    .filter((wall) => wall.kind === 'rail')
    .map((wall) => {
      const length = Math.hypot(wall.bx - wall.ax, wall.bz - wall.az)
      const ux = (wall.bx - wall.ax) / length
      const uz = (wall.bz - wall.az) / length
      // Centre line of the rail, corners met in their middle
      const ends = railEnds(wall, hole.pads)
      const endA = ends.a ? half : 0
      const endB = ends.b ? half : 0
      const lift = render.railHeight - half
      const a: [number, number, number] = [
        wall.ax - ux * endA + wall.nx * half,
        wall.fa + lift,
        wall.az - uz * endA + wall.nz * half,
      ]
      const b: [number, number, number] = [
        wall.bx + ux * endB + wall.nx * half,
        wall.fb + lift,
        wall.bz + uz * endB + wall.nz * half,
      ]

      return { a, b, knobs: [...(ends.a ? [a] : []), ...(ends.b ? [b] : [])] }
    })
}

/**
 * Pad containing a point
 * @param {GolfPad[]} pads - Slabs
 * @param {number} x - X
 * @param {number} z - Z
 * @return {GolfPad | undefined} - Slab
 */

const padAt = (pads: GolfPad[], x: number, z: number): GolfPad | undefined =>
  pads.find((pad) => x >= pad.x0 && x <= pad.x1 && z >= pad.z0 && z <= pad.z1)

/**
 * Point lying on a wall line
 * @param {GolfWall} wall - Wall
 * @param {number} x - X
 * @param {number} z - Z
 * @return {boolean} - On it
 */

const isOnWall = (wall: GolfWall, x: number, z: number): boolean => {
  const dx = wall.bx - wall.ax
  const dz = wall.bz - wall.az
  const along = ((x - wall.ax) * dx + (z - wall.az) * dz) / (dx * dx + dz * dz)
  if (along < 0 || along > 1) return false

  return Math.hypot(wall.ax + dx * along - x, wall.az + dz * along - z) < 1e-3
}

/**
 * Four sides of a slab with their outward normal
 * @param {GolfPad} pad - Slab
 * @return {GolfEdgeLine[]} - Sides
 */

const sidesOf = (pad: GolfPad): GolfEdgeLine[] => [
  { ax: pad.x0, az: pad.z0, bx: pad.x1, bz: pad.z0, nx: 0, nz: -1 },
  { ax: pad.x1, az: pad.z0, bx: pad.x1, bz: pad.z1, nx: 1, nz: 0 },
  { ax: pad.x1, az: pad.z1, bx: pad.x0, bz: pad.z1, nx: 0, nz: 1 },
  { ax: pad.x0, az: pad.z1, bx: pad.x0, bz: pad.z0, nx: -1, nz: 0 },
]

/**
 * Parts of the slab sides kept by a test, merged into lines
 * @param {GolfPad} pad - Slab
 * @param {(x: number, z: number, side: GolfEdgeLine) => boolean} keep - Test on a side point
 * @return {GolfEdgeLine[]} - Lines
 */

const keptLines = (
  pad: GolfPad,
  keep: (x: number, z: number, side: GolfEdgeLine) => boolean
): GolfEdgeLine[] =>
  sidesOf(pad).flatMap((side) => {
    const length = Math.hypot(side.bx - side.ax, side.bz - side.az)
    const steps = Math.max(1, Math.round(length / edge.step))
    const lines: GolfEdgeLine[] = []
    let start: number | null = null
    for (let step = 0; step <= steps; step += 1) {
      const middle = (step + 0.5) / steps
      const isKept =
        step < steps &&
        keep(side.ax + (side.bx - side.ax) * middle, side.az + (side.bz - side.az) * middle, side)
      if (isKept && start === null) start = step / steps
      if (!isKept && start !== null) {
        const end = step / steps
        lines.push({
          ...side,
          ax: side.ax + (side.bx - side.ax) * start,
          az: side.az + (side.bz - side.az) * start,
          bx: side.ax + (side.bx - side.ax) * end,
          bz: side.az + (side.bz - side.az) * end,
        })
        start = null
      }
    }
    return lines
  })

// Probe just past a side
const PROBE = 0.02

/**
 * Slab sides with neither rail nor neighbour: the ball can fall there
 * @param {GolfHole} hole - Hole
 * @return {GolfEdgeLine[]} - Open lines
 */

export const openEdges = (hole: GolfHole): GolfEdgeLine[] => {
  const rails = hole.walls.filter((wall) => wall.kind === 'rail')

  return hole.pads.flatMap((pad) =>
    keptLines(
      pad,
      (x, z, side) =>
        !rails.some((wall) => isOnWall(wall, x, z)) &&
        !padAt(
          hole.pads.filter((other) => other !== pad),
          x + side.nx * PROBE,
          z + side.nz * PROBE
        )
    )
  )
}

/**
 * Sand sides not touching more sand
 * @param {GolfHole} hole - Hole
 * @return {GolfEdgeLine[]} - Rim lines
 */

export const sandEdges = (hole: GolfHole): GolfEdgeLine[] =>
  hole.pads
    .filter((pad) => pad.surface === GolfSurfaces.Sand)
    .flatMap((pad) =>
      keptLines(
        pad,
        (x, z, side) =>
          padAt(
            hole.pads.filter((other) => other !== pad),
            x + side.nx * PROBE,
            z + side.nz * PROBE
          )?.surface !== GolfSurfaces.Sand
      )
    )

/**
 * Feet of the cliffs, on the lower slab
 * @param {GolfHole} hole - Hole
 * @return {GolfEdgeLine[]} - Lines
 */

export const cliffFeet = (hole: GolfHole): GolfEdgeLine[] =>
  hole.walls
    .filter((wall) => wall.kind === 'cliff')
    .map(({ ax, az, bx, bz, nx, nz }) => ({ ax, az, bx, bz, nx, nz }))

/**
 * Flat bands laid on the ground inside the given lines, across coordinate 0 at the line
 * @param {GolfHole} hole - Hole
 * @param {GolfEdgeLine[]} lines - Lines
 * @param {number} width - Band width
 * @return {BufferGeometry} - Bands
 */

export const edgeBands = (hole: GolfHole, lines: GolfEdgeLine[], width: number): BufferGeometry => {
  const positions: number[] = []
  const coords: number[] = []
  // Just inside, so the floor under it is the slab's own
  const inset = 1e-3
  const at = (x: number, z: number, across: number) => {
    positions.push(x, (floorHeight(hole, x, z) ?? 0) + edge.lift, z)
    coords.push(0, across)
  }
  for (const line of lines) {
    const a = [line.ax - line.nx * inset, line.az - line.nz * inset]
    const b = [line.bx - line.nx * inset, line.bz - line.nz * inset]
    const ia = [a[0] - line.nx * width, a[1] - line.nz * width]
    const ib = [b[0] - line.nx * width, b[1] - line.nz * width]
    for (const [[x, z], across] of [
      [a, 0],
      [b, 0],
      [ib, 1],
      [a, 0],
      [ib, 1],
      [ia, 1],
    ] as [number[], number][])
      at(x, z, across)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(coords, 2))

  return geometry
}
