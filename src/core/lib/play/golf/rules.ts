import { padUnder } from '@/core/lib/play/golf/terrain'
import type { GolfHole } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPhases, GolfSurfaces } from '@/utils/constants/play'
import type { GolfPhaseName } from '@/utils/constants/play'

// Moment as stored, sent or counted
type GolfMoment = Date | string | number

/**
 * Timers of the hole in play
 * @typedef {Object} GolfClock
 */

export interface GolfClock {
  hole: number
  startsAt: GolfMoment
  endsAt: GolfMoment
  closedAt: GolfMoment | null
}

/**
 * Milliseconds of a moment
 * @param {GolfMoment} date - Moment
 * @return {number} - Epoch ms
 */

const msOf = (date: GolfMoment): number => new Date(date).getTime()

/**
 * Stage of the hole at a moment
 * @param {GolfClock} clock - Hole timers
 * @param {number} now - Server ms
 * @param {number} holes - Holes of the game
 * @return {GolfPhaseName} - Stage
 */

export const golfPhase = (clock: GolfClock, now: number, holes: number): GolfPhaseName => {
  if (clock.closedAt && now >= msOf(clock.closedAt)) {
    return clock.hole + 1 >= holes ? GolfPhases.Over : GolfPhases.Closed
  }

  return now < msOf(clock.startsAt) ? GolfPhases.Countdown : GolfPhases.Playing
}

/**
 * Player finished with the hole
 * @param {{ holedAt: Date | string | null, strokes: number }} player - Player
 * @param {number} maxStrokes - Stroke ceiling
 * @return {boolean} - Done
 */

export const isHoleDone = (
  player: { holedAt: Date | string | null; strokes: number },
  maxStrokes: number
): boolean => Boolean(player.holedAt) || player.strokes >= maxStrokes

/**
 * Strokes written on the card
 * @param {{ holedAt: Date | string | null, strokes: number }} player - Player
 * @param {number} maxStrokes - Stroke ceiling
 * @return {number} - Hole score
 */

export const holeScore = (
  player: { holedAt: Date | string | null; strokes: number },
  maxStrokes: number
): number => (player.holedAt ? player.strokes : maxStrokes + GOLF_SETTINGS.missPenalty)

/**
 * Strokes of a whole card
 * @param {number[]} card - Hole scores
 * @return {number} - Total
 */

export const cardTotal = (card: number[]): number => card.reduce((sum, strokes) => sum + strokes, 0)

/**
 * Point where a laid power may stand
 * @param {GolfHole} hole - Hole
 * @param {number} x - Point x
 * @param {number} z - Point z
 * @return {boolean} - Allowed
 */

export const canPlaceAt = (hole: GolfHole, x: number, z: number): boolean => {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false
  const pad = padUnder(hole.pads, x, z)
  if (!pad || pad.surface === GolfSurfaces.Water) return false
  const gap = GOLF_SETTINGS.placementGap

  return [hole.cup, hole.tee].every(([pointX, pointZ]) => Math.hypot(x - pointX, z - pointZ) >= gap)
}

/**
 * Angle and length of a pull, zero angle toward +z
 * @param {number} dx - Shot x
 * @param {number} dz - Shot z
 * @return {{ angle: number, length: number }} - Direction
 */

export const shotVector = (dx: number, dz: number): { angle: number; length: number } => ({
  angle: Math.atan2(dx, dz),
  length: Math.hypot(dx, dz),
})

/**
 * Players by total, fewest strokes first, leavers last
 * @param {T[]} players - Players with their totals
 * @return {T[]} - Ranking
 */

export const rankCards = <T extends { hasLeft: boolean; total: number }>(players: T[]): T[] =>
  players.toSorted(
    (left, right) => Number(left.hasLeft) - Number(right.hasLeft) || left.total - right.total
  )
