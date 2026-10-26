import type { GolfBody } from '@/core/lib/play/golf/body'
import { halt, isInPlay, speedOf } from '@/core/lib/play/golf/body'
import {
  collideBalls,
  collideBumper,
  collideSpinner,
  collideTotem,
  collideWall,
} from '@/core/lib/play/golf/collide'
import { boostId } from '@/core/lib/play/golf/terrain'
import type { GolfWorld } from '@/core/lib/play/golf/world'
import { pairKey } from '@/core/lib/play/golf/world'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { physics } = GOLF_SETTINGS

/**
 * Rails, cliffs and boxes, sticky walls hold the ball
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @return {void}
 */

const hitWalls = (world: GolfWorld, body: GolfBody): void => {
  for (const wall of world.input.hole.walls) {
    const impact = collideWall(body, wall)
    if (!impact) continue
    if (impact > physics.hitSound) world.emit('wall', body.id, impact)
    if (!body.isSticky) continue
    // Stuck, still falling when flying
    body.vx = 0
    body.vz = 0
    if (!body.isAirborne) return halt(body)
  }
}

/**
 * Bumpers, laid ones worn by each hit
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @return {void}
 */

const hitBumpers = (world: GolfWorld, body: GolfBody): void => {
  for (const bumper of world.bumpers) {
    if (bumper.hazard && (bumper.hazard.lives ?? 0) <= 0) continue
    const impact = collideBumper(body, bumper)
    if (!impact) continue
    world.emit('bumper', bumper.id, impact)
    if (!bumper.hazard) continue
    bumper.hazard.lives = (bumper.hazard.lives ?? 0) - 1
    world.bumperHits[bumper.id] = (world.bumperHits[bumper.id] ?? 0) + 1
  }
}

/**
 * Boost slab a ball just rolled onto
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @return {void}
 */

const hitBoosts = (world: GolfWorld, body: GolfBody): void => {
  const pad = body.pad?.push && !body.isAirborne ? body.pad : null
  if (world.boosting.get(body.id) === pad) return
  world.boosting.set(body.id, pad)
  if (pad) world.emit('boost', boostId(world.input.hole.pads.indexOf(pad)), speedOf(body))
}

/**
 * Turning bars
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @param {number} seconds - Spinner clock
 * @return {void}
 */

const hitSpinners = (world: GolfWorld, body: GolfBody, seconds: number): void => {
  for (const spinner of world.input.hole.spinners) {
    const impact = collideSpinner(body, spinner, seconds)
    if (impact > physics.hitSound) world.emit('spinner', body.id, impact)
  }
}

/**
 * Totems standing up
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @param {number} seconds - Hole clock
 * @return {void}
 */

const hitTotems = (world: GolfWorld, body: GolfBody, seconds: number): void => {
  for (const totem of world.input.hole.totems) {
    const impact = collideTotem(body, totem, seconds)
    if (impact > physics.hitSound) world.emit('totem', totem.id, impact)
  }
}

/**
 * Ball able to meet another
 * @param {GolfBody} body - Body
 * @return {boolean} - Solid
 */

const isSolid = (body: GolfBody): boolean => isInPlay(body) && !body.isGhost && !body.isUntouchable

/**
 * Every pair of solid balls, one at least moving
 * @param {GolfWorld} world - Simulation
 * @return {void}
 */

const hitBalls = (world: GolfWorld): void => {
  const solid = world.bodies.filter(isSolid)
  solid.forEach((left, index) => {
    for (const right of solid.slice(index + 1)) {
      if (!left.isMoving && !right.isMoving) continue
      const key = pairKey(left, right)
      // Pairs born touching wait to part
      if (world.exempt.has(key)) {
        const apart = Math.hypot(left.x - right.x, left.z - right.z) >= left.radius + right.radius
        if (apart) world.exempt.delete(key)
        continue
      }
      const impact = collideBalls(left, right)
      if (impact > physics.hitSound) world.emit('ball', left.id, impact)
    }
  })
}

/**
 * Every contact of one substep
 * @param {GolfWorld} world - Simulation
 * @param {number} at - Server ms
 * @return {void}
 */

export const contactsOf = (world: GolfWorld, at: number): void => {
  const seconds = (at - world.input.holeStart) / 1000
  for (const body of world.bodies) {
    if (!body.isMoving || !isInPlay(body) || body.isGhost) continue
    hitWalls(world, body)
    if (!body.isMoving) continue
    hitBumpers(world, body)
    hitBoosts(world, body)
    hitSpinners(world, body, seconds)
    hitTotems(world, body, seconds)
  }
  if (world.input.collisions) hitBalls(world)
}
