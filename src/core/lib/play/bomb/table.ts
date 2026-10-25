// Degrees in a full turn
const TURN = 360

/**
 * Angle of a seat around the bomb, the first on top
 * @param {number} index - Seat place
 * @param {number} total - Seats
 * @return {number} - Degrees
 */

export const seatAngle = (index: number, total: number): number =>
  total > 0 ? (index * TURN) / total : 0

/**
 * Next arrow angle, always turning forward
 * @param {number} previous - Current angle
 * @param {number} target - Seat angle
 * @return {number} - Unwrapped angle
 */

export const forwardAngle = (previous: number, target: number): number => {
  const delta = (((target - previous) % TURN) + TURN) % TURN

  return previous + delta
}
