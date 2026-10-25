import type { GolfBody } from '@/core/lib/play/golf/body'
import { wake } from '@/core/lib/play/golf/body'
import type { GolfCircle, GolfSpinner, GolfWall } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

// Below this a contact has no direction
const TINY = 1e-9

// Height a ball must clear a wall top by
const CLEAR = 1e-3

/**
 * Closest point of a segment
 * @param {GolfBody} body - Ball
 * @param {number[]} segment - ax, az, bx, bz
 * @return {{ x: number, z: number, t: number }} - Point and position along
 */

const closestOn = (body: GolfBody, [ax, az, bx, bz]: number[]) => {
  const dx = bx - ax
  const dz = bz - az
  const length = dx * dx + dz * dz
  const t =
    length < TINY ? 0 : Math.min(1, Math.max(0, ((body.x - ax) * dx + (body.z - az) * dz) / length))

  return { x: ax + dx * t, z: az + dz * t, t }
}

/**
 * Push a ball out of a point and bounce it
 * @param {GolfBody} body - Ball
 * @param {{ x: number, z: number }} point - Contact
 * @param {number} reach - Contact distance
 * @param {number} bounce - Restitution
 * @param {{ vx: number, vz: number }} [surface] - Moving surface speed
 * @return {number} - Impact speed, zero without contact
 */

const bounceOff = (
  body: GolfBody,
  point: { x: number; z: number },
  reach: number,
  bounce: number,
  surface = { vx: 0, vz: 0 }
): number => {
  const dx = body.x - point.x
  const dz = body.z - point.z
  const distance = Math.hypot(dx, dz)
  if (distance >= reach || distance < TINY) return 0

  // Out of the obstacle first
  const nx = dx / distance
  const nz = dz / distance
  body.x += nx * (reach - distance)
  body.z += nz * (reach - distance)

  // Reflect the relative speed
  const relativeX = body.vx - surface.vx
  const relativeZ = body.vz - surface.vz
  const normal = relativeX * nx + relativeZ * nz
  if (normal >= 0) return 0
  body.vx -= (1 + bounce) * normal * nx
  body.vz -= (1 + bounce) * normal * nz

  return -normal
}

/**
 * Ball against a rail, a cliff or a box side
 * @param {GolfBody} body - Ball
 * @param {GolfWall} wall - Wall
 * @return {number} - Impact speed
 */

export const collideWall = (body: GolfBody, wall: GolfWall): number => {
  const point = closestOn(body, [wall.ax, wall.az, wall.bx, wall.bz])
  const floor = wall.fa + (wall.fb - wall.fa) * point.t

  // Another floor, or clear over the top
  if (body.y < floor - GOLF_SETTINGS.physics.stepUp || body.y >= floor + wall.top - CLEAR) return 0

  return bounceOff(body, point, body.radius, GOLF_SETTINGS.physics.wallBounce)
}

/**
 * Ball against a bumper, kicked away
 * @param {GolfBody} body - Ball
 * @param {GolfCircle & { floor: number }} bumper - Bumper
 * @return {number} - Impact speed
 */

export const collideBumper = (body: GolfBody, bumper: GolfCircle & { floor: number }): number => {
  if (Math.abs(body.y - bumper.floor) > GOLF_SETTINGS.render.blockHeight) return 0
  const impact = bounceOff(body, bumper, body.radius + bumper.r, GOLF_SETTINGS.physics.bumperBounce)
  if (!impact) return 0

  // Always leaves with a kick
  const distance = Math.hypot(body.x - bumper.x, body.z - bumper.z)
  const nx = (body.x - bumper.x) / distance
  const nz = (body.z - bumper.z) / distance
  const away = body.vx * nx + body.vz * nz
  const kick = GOLF_SETTINGS.physics.bumperKick
  if (away < kick) {
    body.vx += nx * (kick - away)
    body.vz += nz * (kick - away)
  }

  return impact
}

/**
 * Ball against a turning bar
 * @param {GolfBody} body - Ball
 * @param {GolfSpinner} spinner - Bar
 * @param {number} seconds - Spinner clock
 * @return {number} - Impact speed
 */

export const collideSpinner = (body: GolfBody, spinner: GolfSpinner, seconds: number): number => {
  if (Math.abs(body.y - spinner.floor) > GOLF_SETTINGS.render.blockHeight) return 0
  const angle = spinner.phase + spinner.speed * seconds
  const half = spinner.length / 2
  const ux = Math.cos(angle) * half
  const uz = Math.sin(angle) * half
  const point = closestOn(body, [spinner.x - ux, spinner.z - uz, spinner.x + ux, spinner.z + uz])

  // Bar speed where it touches
  const surface = {
    vx: -spinner.speed * (point.z - spinner.z),
    vz: spinner.speed * (point.x - spinner.x),
  }

  return bounceOff(
    body,
    point,
    body.radius + GOLF_SETTINGS.physics.spinnerThickness,
    GOLF_SETTINGS.physics.spinnerBounce,
    surface
  )
}

/**
 * Two balls meeting, momentum shared by mass
 * @param {GolfBody} left - First ball
 * @param {GolfBody} right - Second ball
 * @return {number} - Impact speed
 */

export const collideBalls = (left: GolfBody, right: GolfBody): number => {
  const dx = right.x - left.x
  const dz = right.z - left.z
  const distance = Math.hypot(dx, dz)
  const reach = left.radius + right.radius
  if (distance >= reach || distance < TINY || Math.abs(left.y - right.y) > reach) return 0

  // Apart, the lighter moves more
  const nx = dx / distance
  const nz = dz / distance
  const total = left.mass + right.mass
  const overlap = reach - distance
  left.x -= nx * overlap * (right.mass / total)
  left.z -= nz * overlap * (right.mass / total)
  right.x += nx * overlap * (left.mass / total)
  right.z += nz * overlap * (left.mass / total)
  wake(left)
  wake(right)

  // Elastic exchange along the contact
  const closing = (left.vx - right.vx) * nx + (left.vz - right.vz) * nz
  if (closing <= 0) return 0
  const impulse =
    ((1 + GOLF_SETTINGS.physics.ballBounce) * closing) / (1 / left.mass + 1 / right.mass)
  left.vx -= (impulse / left.mass) * nx
  left.vz -= (impulse / left.mass) * nz
  right.vx += (impulse / right.mass) * nx
  right.vz += (impulse / right.mass) * nz

  return closing
}
