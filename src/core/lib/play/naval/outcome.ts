// Score of a place, above any performance
const PLACE_WEIGHT = 1000

// Points for a ship sunk
const SUNK_POINTS = 20

/**
 * Final score of a captain
 * @param {Object} input - Standing
 * @param {number} input.place - Place won, 1 is best
 * @param {number} input.players - Players at the table
 * @param {number} input.sunk - Ships sunk
 * @param {number} input.hits - Squares hit
 * @return {number} - Score
 */

export const standingScore = ({
  place,
  players,
  sunk,
  hits,
}: {
  place: number
  players: number
  sunk: number
  hits: number
}): number =>
  (players + 1 - place) * PLACE_WEIGHT + Math.min(PLACE_WEIGHT - 1, sunk * SUNK_POINTS + hits)
