import { activePowers, ballScale } from '@/core/lib/play/golf/effects'
import { padHeight, padUnder } from '@/core/lib/play/golf/terrain'
import type { GolfBallInput, GolfPad, GolfShotInput } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPowers } from '@/utils/constants/play'

/**
 * Ball inside the simulation
 * @typedef {Object} GolfBody
 */

export interface GolfBody {
  id: string
  x: number
  z: number
  y: number
  vx: number
  vz: number
  radius: number
  mass: number
  // Rest spot before the shot
  originX: number
  originZ: number
  pad: GolfPad | null
  isMoving: boolean
  hasMoved: boolean
  isHoled: boolean
  hasFallen: boolean
  isGhost: boolean
  isSticky: boolean
  isUntouchable: boolean
  captureScale: number
  powerScale: number
  canPick: boolean
  // Rolling over the cup
  inCup: boolean
  path: number[]
}

/**
 * Ball at rest, its powers applied
 * @param {GolfBallInput} ball - Ball
 * @param {GolfShotInput} input - Shot
 * @return {GolfBody} - Body
 */

export const createBody = (ball: GolfBallInput, input: GolfShotInput): GolfBody => {
  const powers = activePowers(ball.effects, input.at)
  const scale = ballScale(powers)
  const pad = padUnder(input.hole.pads, ball.x, ball.z)

  return {
    id: ball.id,
    x: ball.x,
    z: ball.z,
    y: pad ? padHeight(pad, ball.x, ball.z) : 0,
    vx: 0,
    vz: 0,
    radius: GOLF_SETTINGS.physics.ballRadius * scale,
    mass: scale * scale,
    originX: ball.x,
    originZ: ball.z,
    pad,
    isMoving: false,
    hasMoved: false,
    isHoled: false,
    hasFallen: false,
    // Ghost only carries its own stroke
    isGhost: ball.id === input.shooterId && powers.has(GolfPowers.Ghost),
    isSticky: powers.has(GolfPowers.Sticky),
    isUntouchable: powers.has(GolfPowers.AntiCollision),
    captureScale: powers.has(GolfPowers.Giant) ? GOLF_SETTINGS.powers.giant.capture : 1,
    powerScale: powers.has(GolfPowers.Mini) ? GOLF_SETTINGS.powers.mini.power : 1,
    canPick: ball.canPick,
    inCup: false,
    path: [],
  }
}

/**
 * Speed of a body
 * @param {GolfBody} body - Body
 * @return {number} - Metres per second
 */

export const speedOf = (body: GolfBody): number => Math.hypot(body.vx, body.vz)

/**
 * Body set in motion
 * @param {GolfBody} body - Body
 * @return {void}
 */

export const wake = (body: GolfBody): void => {
  body.isMoving = true
  body.hasMoved = true
}

/**
 * Body brought to rest
 * @param {GolfBody} body - Body
 * @return {void}
 */

export const halt = (body: GolfBody): void => {
  body.vx = 0
  body.vz = 0
  body.isMoving = false
}

/**
 * Body still on the course
 * @param {GolfBody} body - Body
 * @return {boolean} - In play
 */

export const isInPlay = (body: GolfBody): boolean => !body.isHoled && !body.hasFallen
