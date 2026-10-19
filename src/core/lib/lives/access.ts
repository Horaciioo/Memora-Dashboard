import { LiveStatuses } from '@/utils/constants/lives'
import type { LiveStatusName } from '@/utils/constants/lives'

/**
 * Whether a live may be entered
 * @typedef {'open' | 'early' | 'over'} LiveAccess
 */

export type LiveAccess = 'open' | 'early' | 'over'

/**
 * Where a live stands for someone who wants in: the planned end is only approximate, so only the start and the status count
 * @param {Object} live - Live coordinates
 * @param {LiveStatusName} live.status - Live status
 * @param {Date} live.plannedStartAt - Planned start
 * @param {Date} now - Current moment
 * @param {number} prepMinutes - Minutes open before the start to get ready
 * @return {LiveAccess} - Open, not yet, or over
 */

export const liveAccess = (
  live: { status: LiveStatusName; plannedStartAt: Date },
  now: Date,
  prepMinutes: number
): LiveAccess => {
  if (live.status === LiveStatuses.Ended || live.status === LiveStatuses.Cancelled) return 'over'
  if (live.status === LiveStatuses.Live) return 'open'

  return +now >= +live.plannedStartAt - prepMinutes * 60_000 ? 'open' : 'early'
}

/**
 * Whether a closed live may be put back: closed before its planned end, and not long ago
 * @param {Object} live - Live coordinates
 * @param {LiveStatusName} live.status - Live status
 * @param {Date | null} live.endedAt - Closing moment
 * @param {Date | null} live.plannedEndAt - Planned end
 * @param {Date} now - Current moment
 * @param {number} recentHours - Hours a closed live stays on the board
 * @return {boolean} - Can be reopened
 */

export const isReopenable = (
  live: { status: LiveStatusName; endedAt: Date | null; plannedEndAt: Date | null },
  now: Date,
  recentHours: number
): boolean =>
  live.status === LiveStatuses.Ended &&
  live.endedAt !== null &&
  live.plannedEndAt !== null &&
  +live.endedAt < +live.plannedEndAt &&
  +now - +live.endedAt < recentHours * 3_600_000
