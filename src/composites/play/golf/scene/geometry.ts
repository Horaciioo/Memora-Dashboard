import { BufferGeometry, Float32BufferAttribute } from 'three'

import { holdsCup, holedTop, pitFaces } from '@/composites/play/golf/scene/cupPit'
import { holeSeed, seededRandom } from '@/composites/play/golf/scene/random'
import { padHeight } from '@/core/lib/play/golf'
import type { GolfHole, GolfPad, GolfWall } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfSurfaces } from '@/utils/constants/play'
import type { GolfSurfaceName } from '@/utils/constants/play'

const { render } = GOLF_SETTINGS
const { patch, sand } = GOLF_SCENE

// Corner on the ground, x then z
type Corner = [number, number]

// Numbers of one quad, two triangles
const QUAD = 18

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
 * @param {boolean} hasPatches - Wall coordinates for the colour patches
 * @return {BufferGeometry} - Geometry
 */

const geometryOf = (positions: number[], hasPatches = false): BufferGeometry => {
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  if (hasPatches) {
    // Along the wall whatever its direction, then up
    const scale = 1 / (patch.cells * patch.cell)
    const coords = Array.from({ length: positions.length / 3 }, (_, vertex) => [
      (positions[vertex * 3] + positions[vertex * 3 + 2]) * scale,
      positions[vertex * 3 + 1] * scale,
    ])
    geometry.setAttribute('uv', new Float32BufferAttribute(coords.flat(), 2))
  }

  return geometry
}

/**
 * Distance to each side of a slab, per vertex
 * @param {GolfPad} pad - Slab
 * @param {number[]} positions - Triangle positions on it
 * @return {number[]} - West, east, north, south
 */

const shoreOf = (pad: GolfPad, positions: number[]): number[] =>
  Array.from({ length: positions.length / 3 }, (_, vertex) => {
    const x = positions[vertex * 3]
    const z = positions[vertex * 3 + 2]
    return [x - pad.x0, pad.x1 - x, z - pad.z0, pad.z1 - z]
  }).flat()

/**
 * Lawn geometry with ground coordinates, and the water edge when given
 * @param {number[]} positions - Triangle positions
 * @param {number[]} [shore] - Distances to the slab sides
 * @return {BufferGeometry} - Geometry
 */

const groundGeometry = (positions: number[], shore?: number[]): BufferGeometry => {
  const geometry = geometryOf(positions)
  // Metres to texture repeats
  const scale = 1 / (sand.cells * sand.cell)
  const coords = Array.from({ length: positions.length / 3 }, (_, vertex) => [
    positions[vertex * 3] * scale,
    positions[vertex * 3 + 2] * scale,
  ])
  geometry.setAttribute('uv', new Float32BufferAttribute(coords.flat(), 2))
  if (shore) geometry.setAttribute('shore', new Float32BufferAttribute(shore, 4))

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
 * @param {number} bottom - Course bottom
 * @param {number} index - Rail number
 * @return {{ top: number[], inner: number[], outer: number[] }} - Faces
 */

const railFaces = (wall: GolfWall, bottom: number, index: number) => {
  const length = Math.hypot(wall.bx - wall.ax, wall.bz - wall.az)
  const ux = (wall.bx - wall.ax) / length
  const uz = (wall.bz - wall.az) / length
  // Corner ends stretched to close them, openings left flush with the path
  // Just short of the neighbour's outer face, no shared plane
  const reach = render.railWidth - 0.004
  const reachA = wall.cutA ? 0 : reach
  const reachB = wall.cutB ? 0 : reach
  const ax = wall.ax - ux * reachA
  const az = wall.az - uz * reachA
  const bx = wall.bx + ux * reachB
  const bz = wall.bz + uz * reachB
  const ox = wall.nx * render.railWidth
  const oz = wall.nz * render.railWidth
  const floors = [wall.fa, wall.fb, wall.fb, wall.fa]

  const { top, sides } = prism(
    [
      [ax, az],
      [bx, bz],
      [bx + ox, bz + oz],
      [ax + ox, az + oz],
    ],
    // Own sliver of height, tops never coplanar
    floors.map((floor) => floor + render.railHeight + index * 0.0007),
    floors.map(() => bottom)
  )
  // Third quad is the outer face, the one seen from outside
  const outer = sides.slice(QUAD * 2, QUAD * 3)

  return { top, inner: [...sides.slice(0, QUAD * 2), ...sides.slice(QUAD * 3)], outer }
}

/**
 * Straight block hanging under every slab, same footprint all the way down
 * @param {GolfPad[]} pads - Slabs
 * @param {number} floor - Course bottom
 * @return {number[]} - Triangle positions
 */

const undersideFaces = (pads: GolfPad[], floor: number): number[] => {
  const bottom = floor - GOLF_SCENE.island.depth

  return pads.flatMap((pad) => {
    const corners = padCorners(pad)
    const faces = prism(
      corners,
      corners.map(() => floor),
      corners.map(() => bottom)
    )
    return faces.sides
  })
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
  const shores: number[] = []
  const sides: number[] = []
  const cupPad = hole.pads.find((pad) => holdsCup(pad, hole.cup))

  // One lawn per surface, the cup slab opened
  for (const pad of hole.pads) {
    const corners = padCorners(pad)
    const faces = prism(
      corners,
      corners.map(([x, z]) => padHeight(pad, x, z)),
      corners.map(() => floor)
    )
    const top = pad === cupPad ? holedTop(pad, hole.cup) : faces.top
    tops.set(pad.surface, [...(tops.get(pad.surface) ?? []), ...top])
    if (pad.surface === GolfSurfaces.Water) shores.push(...shoreOf(pad, top))
    sides.push(...faces.sides)
  }

  // Rails and boxes
  // Rail faces drop straight down with the wall, no ledge
  const rails = hole.walls
    .filter((wall) => wall.kind === 'rail')
    .map((wall, index) => railFaces(wall, floor - GOLF_SCENE.island.depth, index))
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

  const pit = cupPad ? pitFaces(cupPad, hole.cup) : null

  return {
    floor,
    pit: pit && {
      funnel: geometryOf(pit.funnel),
      wall: geometryOf(pit.wall),
      floor: geometryOf(pit.floor),
    },
    tops: [...tops].map(([surface, positions]) => ({
      surface,
      geometry: groundGeometry(positions, surface === GolfSurfaces.Water ? shores : undefined),
    })),
    sides: geometryOf(sides, true),
    underside: geometryOf(undersideFaces(hole.pads, floor), true),
    rails: geometryOf(rails.flatMap((faces) => [...faces.top, ...faces.inner])),
    railSides: geometryOf(
      rails.flatMap((faces) => faces.outer),
      true
    ),
    blocks: geometryOf(blocks.flatMap((faces) => faces.sides)),
    blockTops: geometryOf(blocks.flatMap((faces) => faces.top)),
  }
}

/**
 * Column hanging down a wall, fading into the mist
 * @typedef {Object} GolfSpeck
 */

export interface GolfSpeck {
  x: number
  y: number
  z: number
  size: number
  drop: number
}

/**
 * Footprint touching a slab
 * @param {GolfPad} pad - Slab
 * @param {number} x - Centre x
 * @param {number} z - Centre z
 * @param {number} half - Half width
 * @return {boolean} - Touching
 */

const overlaps = (pad: GolfPad, x: number, z: number, half: number): boolean =>
  x + half > pad.x0 && x - half < pad.x1 && z + half > pad.z0 && z - half < pad.z1

/**
 * One or two big columns hanging down the outside of every rail
 * @param {GolfHole} hole - Hole
 * @return {GolfSpeck[]} - Columns
 */

export const wallSpecks = (hole: GolfHole): GolfSpeck[] => {
  const { specks } = GOLF_SCENE
  const random = seededRandom(holeSeed(hole))

  return hole.walls
    .filter((wall) => wall.kind === 'rail')
    .flatMap((wall) => {
      const length = Math.hypot(wall.bx - wall.ax, wall.bz - wall.az)
      return Array.from({ length: length < specks.twoFrom ? 1 : 1 + Math.round(random()) }, () => {
        const along = random()
        const size = specks.min + random() * (specks.max - specks.min)
        const drop = specks.minDrop + random() * (specks.maxDrop - specks.minDrop)
        // Partly sunk in the wall, top a little under the rail
        const out = render.railWidth + size * (0.5 - specks.sink)
        const top = wall.fa + (wall.fb - wall.fa) * along + render.railHeight - specks.under

        return {
          x: wall.ax + (wall.bx - wall.ax) * along + wall.nx * out,
          y: top - drop / 2,
          z: wall.az + (wall.bz - wall.az) * along + wall.nz * out,
          size,
          drop,
        }
      })
    })
    .filter((speck) => !hole.pads.some((pad) => overlaps(pad, speck.x, speck.z, speck.size / 2)))
}
