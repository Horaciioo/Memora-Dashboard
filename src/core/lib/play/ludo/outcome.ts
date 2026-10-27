import { isAllHome, progressOf } from '@/core/lib/play/ludo/rules'
import type { LudoPlan } from '@/core/lib/play/ludo/rules'
import { YARD_STEP } from '@/core/lib/play/ludo/track'
import { LudoEndings } from '@/declarations/play/ludo/settings'
import type { LudoEndingName } from '@/declarations/play/ludo/settings'

// Score of a place, above any distance walked
const PLACE_WEIGHT = 1000

/**
 * Colour as stored, its race and place
 * @typedef {Object} LudoStanding
 */

export interface LudoStanding {
  accountId: string
  pawns: number[]
  finishedAt: Date | null
  place: number | null
}

/**
 * Seats after a move, the taken pawns back in their yard
 * @param {T[]} seats - Seats before
 * @param {Object} move - Move
 * @param {string} move.moverId - Player moving
 * @param {LudoPlan} move.plan - Plan
 * @param {Date} move.now - Moment
 * @return {T[]} - Seats afterwards
 */

export const seatsAfter = <T extends LudoStanding>(
  seats: T[],
  { moverId, plan, now }: { moverId: string; plan: LudoPlan; now: Date }
): T[] => {
  const placed = seats.filter((seat) => seat.place).length

  return seats.map((seat) => {
    const pawns = seat.pawns.map((step, pawn) => {
      if (seat.accountId === moverId && pawn === plan.pawn) return plan.to
      const isTaken = plan.captures.some(
        (taken) => taken.accountId === seat.accountId && taken.pawn === pawn
      )

      return isTaken ? YARD_STEP : step
    })
    const isDone = seat.accountId === moverId && !seat.finishedAt && isAllHome(pawns)

    return isDone ? { ...seat, pawns, finishedAt: now, place: placed + 1 } : { ...seat, pawns }
  })
}

/**
 * Game over for the ending picked
 * @param {Object} input - Table
 * @param {LudoStanding[]} input.seats - Every colour dealt
 * @param {string[]} input.players - Still seated
 * @param {LudoEndingName} input.ending - Ending rule
 * @return {boolean} - Over
 */

export const isBoardOver = ({
  seats,
  players,
  ending,
}: {
  seats: LudoStanding[]
  players: string[]
  ending: LudoEndingName
}): boolean => {
  const present = seats.filter((seat) => players.includes(seat.accountId))
  if (ending === LudoEndings.First && present.some((seat) => seat.finishedAt)) return true

  return present.filter((seat) => !seat.finishedAt).length <= (seats.length > 1 ? 1 : 0)
}

/**
 * Final score, places first then distance
 * @param {LudoStanding} seat - Colour
 * @param {number} seatCount - Places possible
 * @return {number} - Score
 */

export const standingScore = (seat: LudoStanding, seatCount: number): number =>
  (seat.place ? (seatCount + 1 - seat.place) * PLACE_WEIGHT : 0) + progressOf(seat.pawns)
