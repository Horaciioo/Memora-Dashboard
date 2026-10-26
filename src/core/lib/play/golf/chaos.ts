import { compileHole } from '@/core/lib/play/golf/course'
import { canPlaceAt } from '@/core/lib/play/golf/rules'
import type { GolfGameSettings } from '@/core/lib/play/golf/settings'
import type { GolfHole, GolfHoleLayout, GolfPoint, GolfWall } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfModes } from '@/utils/constants/play'

// Tries for each extra orb
const TRIES = 120

// Clear space around an orb
const CLEARANCE = {
  wall: 0.5,
  block: 0.45,
  fixture: 0.55,
  orb: 1.1,
}

// Chaos holes, compiled once
const chaotic = new WeakMap<GolfHole, GolfHole>()

/**
 * Wild format on
 * @param {Pick<GolfGameSettings, 'mode'>} settings - Game settings
 * @return {boolean} - Chaos
 */

export const isChaos = (settings: Pick<GolfGameSettings, 'mode'>): boolean =>
  settings.mode === GolfModes.Chaos

/**
 * Weight of a malus in an orb draw
 * @param {Pick<GolfGameSettings, 'mode'>} settings - Game settings
 * @return {number} - Multiplier
 */

export const malusWeight = (settings: Pick<GolfGameSettings, 'mode'>): number =>
  isChaos(settings) ? GOLF_SETTINGS.chaos.malus : 1

/**
 * Random source that gives the same run everywhere
 * @param {number} seed - Start
 * @return {() => number} - Random in [0, 1[
 */

const seeded = (seed: number): (() => number) => {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let mixed = Math.imul(state ^ (state >>> 15), state | 1)
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Distance from a point to a wall
 * @param {GolfWall} wall - Wall
 * @param {number} x - Point x
 * @param {number} z - Point z
 * @return {number} - Metres
 */

const wallGap = (wall: GolfWall, x: number, z: number): number => {
  const dx = wall.bx - wall.ax
  const dz = wall.bz - wall.az
  const length = dx * dx + dz * dz || 1
  const along = Math.min(1, Math.max(0, ((x - wall.ax) * dx + (z - wall.az) * dz) / length))

  return Math.hypot(x - (wall.ax + dx * along), z - (wall.az + dz * along))
}

/**
 * Spot free of every wall, block and fixture
 * @param {GolfHole} hole - Hole
 * @param {GolfPoint[]} taken - Orbs already standing
 * @param {GolfPoint} spot - Spot asked
 * @return {boolean} - Free
 */

const isFree = (hole: GolfHole, taken: GolfPoint[], [x, z]: GolfPoint): boolean => {
  if (!canPlaceAt(hole, x, z)) return false
  const rounds = [...hole.bumpers, ...hole.vortexes, ...hole.totems]
  const points = hole.portals.flatMap((portal) => [portal.from, portal.to])

  return (
    hole.walls.every((wall) => wallGap(wall, x, z) >= CLEARANCE.wall) &&
    hole.blocks.every(
      (block) =>
        x < block.x0 - CLEARANCE.block ||
        x > block.x1 + CLEARANCE.block ||
        z < block.z0 - CLEARANCE.block ||
        z > block.z1 + CLEARANCE.block
    ) &&
    rounds.every((round) => Math.hypot(x - round.x, z - round.z) >= round.r + CLEARANCE.fixture) &&
    hole.spinners.every(
      (spinner) =>
        Math.hypot(x - spinner.x, z - spinner.z) >= spinner.length / 2 + CLEARANCE.fixture
    ) &&
    points.every(([pointX, pointZ]) => Math.hypot(x - pointX, z - pointZ) >= CLEARANCE.fixture) &&
    taken.every(([orbX, orbZ]) => Math.hypot(x - orbX, z - orbZ) >= CLEARANCE.orb)
  )
}

/**
 * Orbs of a hole, the drawn ones and the extras on free spots
 * @param {GolfHole} hole - Hole
 * @return {GolfPoint[]} - Orb spots
 */

export const chaosOrbs = (hole: GolfHole): GolfPoint[] => {
  const orbs = [...hole.orbs]
  const wanted = hole.orbs.length * GOLF_SETTINGS.chaos.orbs
  const { x0, x1, z0, z1 } = hole.bounds
  // Same seed for the server and every screen
  const random = seeded(Math.round(hole.cup[0] * 100) * 7919 + Math.round(hole.cup[1] * 100))

  while (orbs.length < wanted) {
    let found: GolfPoint | null = null
    for (let attempt = 0; attempt < TRIES && !found; attempt += 1) {
      const spot: GolfPoint = [x0 + random() * (x1 - x0), z0 + random() * (z1 - z0)]
      if (isFree(hole, orbs, spot)) found = spot
    }
    // Crowded hole keeps the orbs it has
    if (!found) break
    orbs.push(found)
  }

  return orbs
}

/**
 * Hole as the format plays it, crowded with orbs in chaos
 * @param {GolfHoleLayout} layout - Drawn hole
 * @param {Pick<GolfGameSettings, 'mode'>} settings - Game settings
 * @return {GolfHole} - Compiled hole
 */

export const holeFor = (
  layout: GolfHoleLayout,
  settings: Pick<GolfGameSettings, 'mode'>
): GolfHole => {
  const hole = compileHole(layout)
  if (!isChaos(settings)) return hole
  const known = chaotic.get(hole)
  if (known) return known

  const crowded = { ...hole, orbs: chaosOrbs(hole) }
  chaotic.set(hole, crowded)

  return crowded
}
