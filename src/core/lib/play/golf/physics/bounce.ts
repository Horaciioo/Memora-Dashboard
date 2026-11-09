import type { GolfBody } from '@/core/lib/play/golf/physics/body'
import { speedOf, wake } from '@/core/lib/play/golf/physics/body'
import type { GolfWorld } from '@/core/lib/play/golf/physics/world'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { bumperMan, boingBoing } = GOLF_SETTINGS.powers

/**
 * Bumper ball of a touching pair, still able to send back
 * @param {GolfBody} left - First
 * @param {GolfBody} right - Second
 * @return {[GolfBody, GolfBody] | null} - Bumper then the ball sent back
 */

export const bouncerOf = (left: GolfBody, right: GolfBody): [GolfBody, GolfBody] | null => {
  if (left.bounce && left.bounceLeft > 0 && !right.bounce) return [left, right]
  if (right.bounce && right.bounceLeft > 0 && !left.bounce) return [right, left]

  return null
}

/**
 * Ball sent back by a bumper ball: a strong kick or a jump, the bumper unmoved
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} bumper - Bumper ball
 * @param {GolfBody} ball - Ball touching it
 * @param {{ vx: number, vz: number }} kept - Bumper speed before the contact
 * @return {void}
 */

export const bounceBack = (
  world: GolfWorld,
  bumper: GolfBody,
  ball: GolfBody,
  kept: { vx: number; vz: number }
): void => {
  const dx = ball.x - bumper.x
  const dz = ball.z - bumper.z
  const distance = Math.hypot(dx, dz) || 1
  const nx = dx / distance
  const nz = dz / distance
  bumper.vx = kept.vx
  bumper.vz = kept.vz
  if (bumper.bounce === 'bumper') {
    ball.vx = nx * bumperMan.kick
    ball.vz = nz * bumperMan.kick
  } else {
    // Thrown in an arc, landing by the usual flight
    const speed = Math.max(speedOf(ball), boingBoing.hop) * boingBoing.keep
    ball.vx = nx * speed
    ball.vz = nz * speed
    ball.vy = boingBoing.hop
    ball.isAirborne = true
    ball.pad = null
  }
  wake(ball)
  bumper.bounceLeft -= 1
  world.bumperHits[bumper.id] = (world.bumperHits[bumper.id] ?? 0) + 1
  world.emit('bumper', bumper.id, speedOf(ball))
}
