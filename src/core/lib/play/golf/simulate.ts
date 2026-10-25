import type { GolfBody } from '@/core/lib/play/golf/body'
import { createBody, halt, isInPlay, speedOf, wake } from '@/core/lib/play/golf/body'
import { canRest, pushBody } from '@/core/lib/play/golf/forces'
import { pathPoint } from '@/core/lib/play/golf/frames'
import { contactsOf } from '@/core/lib/play/golf/contacts'
import { settleGround } from '@/core/lib/play/golf/ground'
import type { GolfWorld } from '@/core/lib/play/golf/world'
import { createWorld } from '@/core/lib/play/golf/world'
import type { GolfShotInput, GolfShotResult } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { physics } = GOLF_SETTINGS

// Most substeps of one step
const MAX_SUBSTEPS = 16

/**
 * Substeps keeping each move under half a radius
 * @param {GolfBody[]} moving - Moving bodies
 * @param {number} dt - Step seconds
 * @return {number} - Substeps
 */

const substepsOf = (moving: GolfBody[], dt: number): number => {
  const fastest = Math.max(...moving.map(speedOf))
  const smallest = Math.min(...moving.map((body) => body.radius))

  return Math.min(MAX_SUBSTEPS, Math.max(1, Math.ceil((fastest * dt) / (smallest * 0.5))))
}

/**
 * Write every body's spot on the frame track
 * @param {GolfWorld} world - Simulation
 * @return {void}
 */

const record = (world: GolfWorld): void => {
  for (const body of world.bodies) body.path.push(...pathPoint(body.x, body.z))
  world.frames += 1
}

/**
 * One fixed step of the simulation
 * @param {GolfWorld} world - Simulation
 * @param {number} step - Step index
 * @return {void}
 */

const advance = (world: GolfWorld, step: number): void => {
  const dt = 1 / physics.stepHz
  const at = world.input.at + step * dt * 1000
  const context = { hazards: world.hazards, cup: world.input.hole.cup, at }
  const moving = world.bodies.filter((body) => body.isMoving)
  for (const body of moving) pushBody(body, context, dt)

  // Small moves, contacts after each
  const substeps = substepsOf(moving, dt)
  for (let index = 0; index < substeps; index += 1) {
    for (const body of world.bodies) {
      if (!body.isMoving) continue
      body.x += (body.vx * dt) / substeps
      body.z += (body.vz * dt) / substeps
    }
    contactsOf(world, at)
    for (const body of world.bodies) if (body.isMoving) settleGround(world, body, at)
  }

  // Slow bodies come to rest
  for (const body of world.bodies) {
    if (body.isMoving && canRest(body)) {
      halt(body)
      settleGround(world, body, at, true)
    }
  }
}

/**
 * Where each moved ball ends
 * @param {GolfWorld} world - Simulation
 * @return {GolfShotResult['outcomes']} - Outcomes
 */

const outcomesOf = (world: GolfWorld): GolfShotResult['outcomes'] =>
  Object.fromEntries(
    world.bodies
      .filter((body) => body.hasMoved)
      .map((body) => [
        body.id,
        {
          x: isInPlay(body) || body.isHoled ? body.x : body.originX,
          z: isInPlay(body) || body.isHoled ? body.z : body.originZ,
          isHoled: body.isHoled,
          hasFallen: body.hasFallen,
        },
      ])
  )

/**
 * Play one stroke to the end
 * @param {GolfShotInput} input - Shot
 * @return {GolfShotResult} - Tracks and outcomes
 */

export const simulateShot = (input: GolfShotInput): GolfShotResult => {
  const world = createWorld(
    input,
    input.balls.map((ball) => createBody(ball, input))
  )
  const shooter = world.bodies.find((body) => body.id === input.shooterId)
  if (shooter) {
    // Stroke speed, angle zero toward +z
    const speed = Math.min(1, Math.max(0, input.power)) * physics.maxSpeed * shooter.powerScale
    shooter.vx = Math.sin(input.angle) * speed
    shooter.vz = Math.cos(input.angle) * speed
    wake(shooter)
    world.emit('hit', shooter.id, speed)
  }

  // Fixed steps until all rest
  record(world)
  const maxSteps = Math.ceil(physics.maxSeconds * physics.stepHz)
  for (let step = 1; step <= maxSteps && world.bodies.some((body) => body.isMoving); step += 1) {
    advance(world, step)
    if (step % physics.frameEvery === 0) record(world)
  }
  record(world)
  for (const body of world.bodies) if (body.isMoving) halt(body)

  return {
    frameMs: (1000 * physics.frameEvery) / physics.stepHz,
    frames: world.frames,
    paths: Object.fromEntries(
      world.bodies.filter((body) => body.hasMoved).map((body) => [body.id, body.path])
    ),
    outcomes: outcomesOf(world),
    events: world.events,
    bumperHits: world.bumperHits,
    pickups: world.pickups,
  }
}
