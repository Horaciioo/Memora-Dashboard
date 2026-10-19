/**
 * Stretch a member moderated
 * @typedef {Object} StintRow
 * @property {string} accountId - Member
 * @property {Date} startedAt - Stretch start
 * @property {Date | null} stoppedAt - Stretch end, none while open
 */

export interface StintRow {
  accountId: string
  startedAt: Date
  stoppedAt: Date | null
}

/**
 * Moderation time of one member
 * @typedef {Object} StintTotal
 * @property {string} accountId - Member
 * @property {number} seconds - Time moderated
 * @property {Date} from - First start
 * @property {Date} to - Last end
 */

export interface StintTotal {
  accountId: string
  seconds: number
  from: Date
  to: Date
}

/**
 * Fold the stretches of a live into a total per member
 * @param {StintRow[]} rows - Stretches
 * @param {Date} cap - End given to a stretch still open
 * @return {StintTotal[]} - Totals, earliest start first
 */

export const foldStints = (rows: StintRow[], cap: Date): StintTotal[] =>
  [...Map.groupBy(rows, (row) => row.accountId)]
    .map(([accountId, list]) => {
      const ends = list.map((row) => Math.max(+row.startedAt, +(row.stoppedAt ?? cap)))
      const seconds = list.reduce(
        (sum, row, index) => sum + (ends[index] - +row.startedAt) / 1000,
        0
      )

      return {
        accountId,
        seconds: Math.round(seconds),
        from: new Date(Math.min(...list.map((row) => +row.startedAt))),
        to: new Date(Math.max(...ends)),
      }
    })
    .sort((left, right) => +left.from - +right.from)

/**
 * Time moderated inside and outside the hours given
 * @param {StintRow[]} rows - Stretches of one member
 * @param {Date} cap - End given to a stretch still open
 * @param {{ from: Date, to: Date }} hours - Hours given
 * @return {{ inside: number, outside: number }} - Seconds each side
 */

export const windowFit = (
  rows: StintRow[],
  cap: Date,
  hours: { from: Date; to: Date }
): { inside: number; outside: number } => {
  let inside = 0
  let outside = 0

  rows.forEach((row) => {
    const start = +row.startedAt
    const end = Math.max(start, +(row.stoppedAt ?? cap))
    const shared = Math.max(0, Math.min(end, +hours.to) - Math.max(start, +hours.from))
    inside += shared / 1000
    outside += (end - start - shared) / 1000
  })

  return { inside: Math.round(inside), outside: Math.round(outside) }
}
