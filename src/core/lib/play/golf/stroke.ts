import type { GolfBallInput, GolfEffect } from '@/core/lib/play/golf/types'

/**
 * Ball as both the server and the screens know it
 * @typedef {Object} GolfStrokeBall
 */

export interface GolfStrokeBall {
  accountId: string
  x: number
  z: number
  strokes: number
  isDone: boolean
  // Server ms it stops
  restsAt: number
  effects: GolfEffect[]
  // Powers in hand
  hand: string[]
}

/**
 * Balls a stroke can meet: the one hit, then those at rest on the course
 * @param {GolfStrokeBall[]} balls - Present balls
 * @param {string} shooterId - Player hitting
 * @param {number} at - Server ms
 * @param {number} handRoom - Hand size, none without orbs
 * @return {GolfBallInput[]} - Simulation balls
 */

export const strokeBalls = (
  balls: GolfStrokeBall[],
  shooterId: string,
  at: number,
  handRoom: number
): GolfBallInput[] =>
  balls
    .filter(
      (ball) =>
        ball.accountId === shooterId || (ball.strokes > 0 && !ball.isDone && ball.restsAt <= at)
    )
    .map((ball) => ({
      id: ball.accountId,
      x: ball.x,
      z: ball.z,
      effects: ball.effects,
      canPick: ball.hand.length < handRoom,
    }))
