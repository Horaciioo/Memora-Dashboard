import { LiveStatuses } from '@/utils/constants/lives'
import type { LiveStatusName } from '@/utils/constants/lives'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { AttendanceStatusName } from '@/utils/constants/workflow'

/**
 * One live as a junior's count reads it
 * @typedef {Object} AccompaniedLive
 * @property {LiveStatusName} status - Live status
 * @property {Date | null} startedAt - Real start
 * @property {AttendanceStatusName | null} attendance - Junior's roll-call answer
 */

export interface AccompaniedLive {
  status: LiveStatusName
  startedAt: Date | null
  attendance: AttendanceStatusName | null
}

/**
 * Count the lives a junior really accompanied since their PIM started
 * @param {AccompaniedLive[]} lives - Lives the junior was called on
 * @param {Date} since - Junior's own start
 * @return {number} - Lives counted
 */

export const countAccompaniedLives = (lives: AccompaniedLive[], since: Date): number =>
  lives.filter(
    (live) =>
      live.status === LiveStatuses.Ended &&
      live.attendance === AttendanceStatuses.Present &&
      live.startedAt !== null &&
      live.startedAt >= since
  ).length
