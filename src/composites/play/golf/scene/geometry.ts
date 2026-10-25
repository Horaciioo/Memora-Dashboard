import { BufferGeometry, Float32BufferAttribute } from 'three'

import { padHeight } from '@/core/lib/play/golf'
import type { GolfHole, GolfPad, GolfWall } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import type { GolfSurfaceName } from '@/utils/constants/play'

const { render } = GOLF_SETTINGS

// Corner on the ground, x then z
type Corner = [number, number]

/**
 * Faces of a four sided column, top and sides apart
 * @param {Corner[]} corners - Four corners in order
 * @param {number[]} tops - Top height per corner
 * @param {number[]} bottoms - Bottom height per corner
 * @return {{ top: number[], sides: number[] }} - Triangle positions
 */

const prism = (corners: Corner[], tops: number[], bottoms: number[]) => {
  const up = corners.map(([x, z], index) => [x, tops[index], z])
  const down = corners.map(([x, z], index) => [x, bottoms[index], z])
  const quad = (out: number[], a: number[], b: number[], c: number[], d: number[]) =>
    out.push(...a, ...b, ...c, ...a, ...c, ...d)

  const top: number[] = []
  quad(top, up[0], up[3], up[2], up[1])
  const sides: number[] = []
  corners.forEach((_, index) => {
    const next = (index + 1) % corners.length
    quad(sides, up[index], up[next], down[next], down[index])
  })

  return { top, sides }
}

/**
 * Geometry from triangle positions
 * @param {number[]} positions - Triangle positions
 * @return {BufferGeometry} - Geometry
 */

const geometryOf = (positions: number[]): BufferGeometry => {
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()

  return geometry
}

/**
 * Corners of a slab
 * @param {GolfPad} pad - Slab
 * @return {Corner[]} - Corners
 */

const padCorners = (pad: GolfPad): Corner[] => [
  [pad.x0, pad.z0],
  [pad.x1, pad.z0],
  [pad.x1, pad.z1],
  [pad.x0, pad.z1],
]

/**
 * Rail as a thin column outside its slab
 * @param {GolfWall} wall - Rail
 * @return {{ top: number[], sides: number[] }} - Faces
 */

const railFaces = (wall: GolfWall) => {
  const length = Math.hypot(wall.bx - wall.ax, wall.bz - wall.az)
  const ux = (wall.bx - wall.ax) / length
  const uz = (wall.bz - wall.az) / length
  // Ends stretched to close the corners
  const reach = render.railWidth
  const ax = wall.ax - ux * reach
  const az = wall.az - uz * reach
  const bx = wall.bx + ux * reach
  const bz = wall.bz + uz * reach
  const ox = wall.nx * render.railWidth
  const oz = wall.nz * render.railWidth
  const floors = [wall.fa, wall.fb, wall.fb, wall.fa]

  return prism(
    [
      [ax, az],
      [bx, bz],
      [bx + ox, bz + oz],
      [ax + ox, az + oz],
    ],
    floors.map((floor) => floor + render.railHeight),
    floors.map((floor) => floor - render.floorDepth)
  )
}

/**
 * Meshes of a hole: lawn per surface, slab sides, rails and boxes
 * @param {GolfHole} hole - Hole
 * @return {Object} - Geometries
 */

export const courseGeometry = (hole: GolfHole) => {
  // Every slab hangs to the same depth
  const lowest = hole.pads.flatMap((pad) => padCorners(pad).map(([x, z]) => padHeight(pad, x, z)))
  const floor = Math.min(...lowest) - render.floorDepth
  const tops = new Map<GolfSurfaceName, number[]>()
  const sides: number[] = []

  // One lawn per surface
  for (const pad of hole.pads) {
    const corners = padCorners(pad)
    const faces = prism(
      corners,
      corners.map(([x, z]) => padHeight(pad, x, z)),
      corners.map(() => floor)
    )
    tops.set(pad.surface, [...(tops.get(pad.surface) ?? []), ...faces.top])
    sides.push(...faces.sides)
  }

  // Rails and boxes
  const rails = hole.walls.filter((wall) => wall.kind === 'rail').map(railFaces)
  const blocks = hole.blocks.map((block) =>
    prism(
      [
        [block.x0, block.z0],
        [block.x1, block.z0],
        [block.x1, block.z1],
        [block.x0, block.z1],
      ],
      [0, 1, 2, 3].map(() => block.floor + render.blockHeight),
      [0, 1, 2, 3].map(() => block.floor)
    )
  )

  return {
    floor,
    tops: [...tops].map(([surface, positions]) => ({ surface, geometry: geometryOf(positions) })),
    sides: geometryOf(sides),
    rails: geometryOf(rails.flatMap((faces) => [...faces.top, ...faces.sides])),
    blocks: geometryOf(blocks.flatMap((faces) => [...faces.top, ...faces.sides])),
  }
}

/**
 * Seeded random source, the same specks on every screen
 * @param {number} seed - Seed
 * @return {() => number} - Zero to one
 */

const seededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Cube popping out of a wall
 * @typedef {Object} GolfSpeck
 */

export interface GolfSpeck {
  x: number
  y: number
  z: number
  size: number
  turn: number
}

/**
 * Little cubes on the outer face of every rail, as on a hand built course
 * @param {GolfHole} hole - Hole
 * @return {GolfSpeck[]} - Cubes
 */

export const wallSpecks = (hole: GolfHole): GolfSpeck[] => {
  const { specks } = GOLF_SCENE
  const random = seededRandom(Math.round((hole.cup[0] + 31) * 977 + (hole.cup[1] + 17) * 131))

  return hole.walls
    .filter((wall) => wall.kind === 'rail')
    .flatMap((wall) => {
      const length = Math.hypot(wall.bx - wall.ax, wall.bz - wall.az)
      return Array.from({ length: Math.round(length * specks.perMetre) }, () => {
        const along = random()
        const size = specks.min + random() * (specks.max - specks.min)
        // Half sunk in the outer face
        const out = render.railWidth + size * (0.5 - specks.sink)
        const floor = wall.fa + (wall.fb - wall.fa) * along

        return {
          x: wall.ax + (wall.bx - wall.ax) * along + wall.nx * out,
          y: floor - render.floorDepth + random() * (render.floorDepth + render.railHeight),
          z: wall.az + (wall.bz - wall.az) * along + wall.nz * out,
          size,
          turn: (random() - 0.5) * specks.tilt,
        }
      })
    })
}
