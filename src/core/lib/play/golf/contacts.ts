import { bounceBack, bouncerOf } from '@/core/lib/play/golf/bounce'
import type { GolfBody } from '@/core/lib/play/golf/body'
import { halt, isInPlay, speedOf } from '@/core/lib/play/golf/body'
import {
  collideBalls,
  collideBumper,
  collideSpinner,
  collideTotem,
  collideWall,
  isWallFacing,
  kickAway,
  reflectOff,
  wallBounce,
} from '@/core/lib/play/golf/collide'
import { collidersOf, queryGrid, sweepBox, sweepSegment } from '@/core/lib/play/golf/colliders'
import type { GolfSweepHit } from '@/core/lib/play/golf/colliders'
import { boostId } from '@/core/lib/play/golf/terrain'
import type { GolfWorld } from '@/core/lib/play/golf/world'
import { pairKey } from '@/core/lib/play/golf/world'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { physics } = GOLF_SETTINGS

// Gap left at a swept contact
const CONTACT_GAP = 1e-4

/**
 * Walls the substep move crossed, the first one met stops it there
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @return {number[]} - Walls near the move
 */

const sweepWalls = (world: GolfWorld, body: GolfBody): number[] => {
  const { walls, wallGrid } = collidersOf(world.input.hole)
  const move = [body.lastX, body.lastZ, body.x - body.lastX, body.z - body.lastZ]
  const near = queryGrid(wallGrid, sweepBox([body.lastX, body.lastZ, body.x, body.z], body.radius))
  let first: (GolfSweepHit & { index: number }) | null = null
  for (const index of near) {
    const wall = walls[index]
    if (!isWallFacing(body, wall)) continue
    const hit = sweepSegment(move, [wall.ax, wall.az, wall.bx, wall.bz], body.radius)
    if (hit && (!first || hit.t < first.t)) first = { ...hit, index }
  }
  if (!first) return near

  // Back to the contact, a hair off
  body.x = body.lastX + move[2] * first.t + first.nx * CONTACT_GAP
  body.z = body.lastZ + move[3] * first.t + first.nz * CONTACT_GAP
  const struck = walls[first.index]
  const impact = reflectOff(body, first.nx, first.nz, wallBounce(struck))
  if (impact && struck.isBouncy) kickAway(body, struck)
  if (impact > physics.hitSound) world.emit('wall', body.id, impact)
  if (body.isSticky) {
    body.vx = 0
    body.vz = 0
    if (!body.isAirborne) halt(body)
  }

  return near
}

/**
 * Rails, cliffs and boxes, sticky walls hold the ball
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @return {void}
 */

const hitWalls = (world: GolfWorld, body: GolfBody): void => {
  const { walls } = collidersOf(world.input.hole)
  const near = sweepWalls(world, body)
  if (!body.isMoving) return
  for (const index of near) {
    const impact = collideWall(body, walls[index])
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
 * Pairs of balls sharing a cell or its neighbours, one at least moving
 * @param {GolfBody[]} bodies - Solid balls
 * @return {[GolfBody, GolfBody][]} - Pairs, each once
 */

export const nearPairs = (bodies: GolfBody[]): [GolfBody, GolfBody][] => {
  const cell = Math.max(physics.gridCell, 2 * Math.max(0, ...bodies.map((body) => body.radius)))
  const keyOf = (col: number, row: number) => `${col}:${row}`
  const cells = new Map<string, number[]>()
  bodies.forEach((body, index) => {
    const key = keyOf(Math.floor(body.x / cell), Math.floor(body.z / cell))
    cells.set(key, [...(cells.get(key) ?? []), index])
  })

  // Moving balls look around them
  const pairs: [GolfBody, GolfBody][] = []
  bodies.forEach((body, index) => {
    if (!body.isMoving) return
    const col = Math.floor(body.x / cell)
    const row = Math.floor(body.z / cell)
    for (let dc = -1; dc <= 1; dc += 1) {
      for (let dr = -1; dr <= 1; dr += 1) {
        for (const other of cells.get(keyOf(col + dc, row + dr)) ?? []) {
          // Moving pairs once, by index
          if (other === index || (bodies[other].isMoving && other < index)) continue
          pairs.push([body, bodies[other]])
        }
      }
    }
  })

  return pairs
}

/**
 * Every pair of solid balls, one at least moving
 * @param {GolfWorld} world - Simulation
 * @return {void}
 */

const hitBalls = (world: GolfWorld): void => {
  const solid = world.bodies.filter(isSolid)
  for (const [left, right] of nearPairs(solid)) {
    const key = pairKey(left, right)
    // Pairs born touching wait to part
    if (world.exempt.has(key)) {
      const apart = Math.hypot(left.x - right.x, left.z - right.z) >= left.radius + right.radius
      if (apart) world.exempt.delete(key)
      continue
    }
    // Bumper ball sends the other back
    const bouncer = bouncerOf(left, right)
    const kept = bouncer && { vx: bouncer[0].vx, vz: bouncer[0].vz }
    const impact = collideBalls(left, right)
    if (bouncer && kept && impact > 0) bounceBack(world, bouncer[0], bouncer[1], kept)
    else if (impact > physics.hitSound) world.emit('ball', left.id, impact)
  }
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
