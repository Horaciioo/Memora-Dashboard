import { CoordinationStatuses } from '@/utils/constants/lives'
import type { CoordinationStatusName } from '@/utils/constants/lives'

/**
 * One member's place in the coordination of a live
 * @typedef {Object} CoordinationSeat
 * @property {string} accountId - Member
 * @property {CoordinationStatusName} status - Answer
 * @property {Date | null} startsAt - Window start
 * @property {Date | null} endsAt - Window end
 */

export interface CoordinationSeat {
  accountId: string
  status: CoordinationStatusName
  startsAt: Date | null
  endsAt: Date | null
}

/**
 * Time span without a coordinator
 * @typedef {Object} CoordinationGap
 * @property {Date} from - Gap start
 * @property {Date} to - Gap end
 */

export interface CoordinationGap {
  from: Date
  to: Date
}

/**
 * Stretches of a live nobody agreed to coordinate
 * @param {Date} start - Live start
 * @param {Date | null} end - Live end
 * @param {CoordinationSeat[]} seats - Every answer
 * @return {CoordinationGap[]} - Uncovered stretches, in order
 */

export const coordinationGaps = (
  start: Date,
  end: Date | null,
  seats: CoordinationSeat[]
): CoordinationGap[] => {
  if (!end) return []

  const windows = seats
    .filter((seat) => seat.status === CoordinationStatuses.Accepted && seat.startsAt && seat.endsAt)
    .map((seat) => ({ from: seat.startsAt as Date, to: seat.endsAt as Date }))
    .sort((a, b) => a.from.getTime() - b.from.getTime())

  const gaps: CoordinationGap[] = []
  let cursor = start

  for (const window of windows) {
    if (window.from > cursor) gaps.push({ from: cursor, to: window.from < end ? window.from : end })
    if (window.to > cursor) cursor = window.to
    if (cursor >= end) break
  }
  if (cursor < end) gaps.push({ from: cursor, to: end })

  return gaps
}

/**
 * Members who hold the coordinator rights right now
 * @param {CoordinationSeat[]} seats - Every answer
 * @param {Date} [now] - Moment checked
 * @return {string[]} - Accounts whose agreed window is not over
 */

export const activeCoordinatorIds = (seats: CoordinationSeat[], now = new Date()): string[] =>
  seats
    .filter(
      (seat) =>
        seat.status === CoordinationStatuses.Accepted && seat.endsAt !== null && seat.endsAt >= now
    )
    .map((seat) => seat.accountId)
