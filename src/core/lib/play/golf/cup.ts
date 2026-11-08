import type { GolfBody } from '@/core/lib/play/golf/body'
import { halt } from '@/core/lib/play/golf/body'
import type { GolfWorld } from '@/core/lib/play/golf/world'
import type { GolfCup } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { cup, physics } = GOLF_SETTINGS

// Where a ball stands toward the cup
export type GolfCupStage = 'none' | 'rim' | 'falling' | 'holed'

// Opening of the pit, inside the funnel
export const CUP_HOLE = cup.radius - cup.funnel

/**
 * Ball small enough to drop in
 * @param {GolfBody} body - Ball
 * @return {boolean} - Fits
 */

export const fitsCup = (body: GolfBody): boolean => body.radius < CUP_HOLE

/**
 * Hole the ball is over, the first one when none
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Ball
 * @return {GolfCup} - Hole
 */

const cupOf = (world: GolfWorld, body: GolfBody): GolfCup => {
  const { cups } = world.input.hole

  return cups[body.cupIndex] ?? cups[0]
}

/**
 * Distance to a cup centre
 * @param {GolfCup} spot - Hole
 * @param {GolfBody} body - Ball
 * @return {number} - Metres
 */

const cupDistance = (spot: GolfCup, body: GolfBody): number =>
  Math.hypot(body.x - spot.x, body.z - spot.z)

/**
 * Pull of the funnel slope toward the centre
 * @param {GolfBody} body - Ball
 * @param {GolfCup} centre - Cup
 * @return {[number, number]} - Acceleration
 */

export const funnelPull = (body: GolfBody, { x: cupX, z: cupZ }: GolfCup): [number, number] => {
  if (body.cupStage !== 'rim') return [0, 0]
  const dx = cupX - body.x
  const dz = cupZ - body.z
  const distance = Math.hypot(dx, dz)
  if (distance < CUP_HOLE || distance < 1e-6) return [0, 0]
  const pull = (physics.gravity * cup.drop) / cup.funnel

  return [(dx / distance) * pull, (dz / distance) * pull]
}

/**
 * Rolling ball on the funnel, dropping once over the opening
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Ball
 * @return {void}
 */

export const rollCup = (world: GolfWorld, body: GolfBody): void => {
  // Nearest hole the ball is over
  const { cups } = world.input.hole
  const near = cups.reduce(
    (best, spot, index) => (cupDistance(spot, body) < cupDistance(cups[best], body) ? index : best),
    Math.max(0, body.cupIndex)
  )
  const spot = cups[near]
  const distance = cupDistance(spot, body)
  const isLevel = Math.abs(body.y - spot.floor) <= physics.stepUp + cup.drop
  if (distance >= cup.radius || !isLevel) {
    body.cupStage = 'none'
    return
  }
  body.cupIndex = near

  // Down the slope, flat over the pit for a ball too big
  const depth = Math.min(1, (cup.radius - distance) / cup.funnel) * cup.drop
  body.y = spot.floor - depth
  body.cupStage = distance >= CUP_HOLE ? 'rim' : 'none'
  if (distance >= CUP_HOLE || !fitsCup(body)) return
  body.cupStage = 'falling'
  body.vy = 0
}

/**
 * Falling ball in the pit: the far wall bounces it, a high one lips out
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Ball
 * @param {number} dt - Seconds
 * @return {void}
 */

export const fallCup = (world: GolfWorld, body: GolfBody, dt: number): void => {
  const spot = cupOf(world, body)
  const { x: cupX, z: cupZ } = spot
  const neck = spot.floor - cup.drop
  body.vy -= physics.fall * dt
  body.y += body.vy * dt

  // Bottom reached, holed here
  if (body.y <= spot.floor - cup.depth) {
    body.y = spot.floor - cup.depth
    body.cupStage = 'holed'
    body.isHoled = true
    halt(body)
    world.emit('cup', body.id)
    return
  }

  // Pit wall met
  const dx = body.x - cupX
  const dz = body.z - cupZ
  const distance = Math.hypot(dx, dz)
  const reach = CUP_HOLE - body.radius
  if (distance <= reach || distance < 1e-6) return
  const nx = dx / distance
  const nz = dz / distance
  const outward = body.vx * nx + body.vz * nz
  // Only the far side, moving out
  if (outward <= 0) return
  if (body.y > neck - body.radius * cup.lipHold) return lipOut(world, body)
  body.x = cupX + nx * reach
  body.z = cupZ + nz * reach
  body.vx -= (1 + cup.lipBounce) * outward * nx
  body.vz -= (1 + cup.lipBounce) * outward * nz
}

/**
 * Ball too high still, it rides over the lip
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Ball
 * @return {void}
 */

const lipOut = (world: GolfWorld, body: GolfBody): void => {
  const spot = cupOf(world, body)
  body.cupStage = 'rim'
  body.y = spot.floor - cup.drop
  body.vy = 0
  body.vx *= cup.lipKeep
  body.vz *= cup.lipKeep
  // Hop onto the far funnel
  const { x: cupX, z: cupZ } = spot
  const dx = body.x - cupX
  const dz = body.z - cupZ
  const distance = Math.hypot(dx, dz) || 1
  body.x = cupX + (dx / distance) * (CUP_HOLE + 1e-3)
  body.z = cupZ + (dz / distance) * (CUP_HOLE + 1e-3)
  world.emit('lip', body.id)
}
