import { holeSeed, seededRandom } from '@/composites/play/golf/scene/random'
import { overviewOf, teeYaw } from '@/composites/play/golf/scene/camera/rig'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { decorCubes: look } = GOLF_SCENE
const CELL = GOLF_SETTINGS.grid.cell

// Plain, chipped, holed
export type GolfDecorShape = 0 | 1 | 2

/**
 * Rounded decor cube, side a whole number of grid cells
 * @typedef {Object} GolfDecorCube
 */

export interface GolfDecorCube {
  x: number
  y: number
  z: number
  size: number
  shape: GolfDecorShape
  // Quarter turns, keeps it on the grid
  turn: number
  tone: number
}

type Rect = GolfHole['bounds']

/**
 * Square footprint reaching into a rectangle, with a margin
 * @param {number} x - Centre x
 * @param {number} z - Centre z
 * @param {number} half - Half side plus margin
 * @param {Rect} rect - Rectangle
 * @return {boolean} - Overlaps
 */

const overlaps = (x: number, z: number, half: number, rect: Rect): boolean =>
  x + half > rect.x0 && x - half < rect.x1 && z + half > rect.z0 && z - half < rect.z1

/**
 * Point inside the wedge the default camera looks through, behind the tee
 * @param {GolfHole} hole - Hole
 * @param {number} x - Point x
 * @param {number} z - Point z
 * @param {number} half - Half side of the cube
 * @return {boolean} - In the way
 */

export const isInCameraWedge = (hole: GolfHole, x: number, z: number, half: number): boolean => {
  const yaw = teeYaw(hole)
  const dx = x - hole.tee[0]
  const dz = z - hole.tee[1]
  // Distance behind the tee, toward the camera
  const back = -(dx * Math.sin(yaw) + dz * Math.cos(yaw))
  const side = Math.abs(dx * Math.cos(yaw) - dz * Math.sin(yaw))

  return back > -half && back < look.wedgeReach && side < back * Math.tan(look.wedge) + half * 2
}

/**
 * Shape picked by its share
 * @param {number} roll - Zero to one
 * @return {GolfDecorShape} - Shape
 */

const shapeOf = (roll: number): GolfDecorShape => {
  const [plain, chipped] = look.shares
  if (roll < plain) return 0

  return roll < plain + chipped ? 1 : 2
}

/**
 * Rounded cubes around and under a hole, evenly spread, the same on every screen
 * @param {GolfHole} hole - Hole
 * @param {Rect[]} taken - Other holes around, kept clear
 * @return {GolfDecorCube[]} - Cubes
 */

export const decorCubesOf = (hole: GolfHole, taken: Rect[] = []): GolfDecorCube[] => {
  const random = seededRandom(holeSeed(hole) * 3 + 11)
  const { center, reach } = overviewOf(hole)
  const kept = [hole.bounds, ...hole.pads, ...taken]
  const cubes: GolfDecorCube[] = []
  const snap = (value: number) => Math.round(value / CELL) * CELL

  for (let tries = 0; tries < look.tries && cubes.length < look.count; tries += 1) {
    const size = look.sizes[Math.floor(random() * look.sizes.length)] * CELL
    const half = size / 2
    const angle = random() * Math.PI * 2
    const distance = reach * (look.near + random() * (look.far - look.near))
    const x = snap(center.x + Math.cos(angle) * distance) + half
    const z = snap(center.z + Math.sin(angle) * distance) + half
    const y = snap(look.low + random() * (look.high - look.low))
    const isClear =
      !kept.some((rect) => overlaps(x, z, half + look.margin * CELL, rect)) &&
      !isInCameraWedge(hole, x, z, half) &&
      !cubes.some(
        (other) =>
          Math.max(Math.abs(other.x - x), Math.abs(other.z - z)) <
          half + other.size / 2 + look.spacing * CELL
      )
    if (!isClear) continue
    cubes.push({
      x,
      y,
      z,
      size,
      shape: shapeOf(random()),
      turn: Math.floor(random() * 4),
      tone: Math.floor(random() * look.tones),
    })
  }

  return cubes
}
