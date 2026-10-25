import { AttendanceStatuses } from '@/utils/constants/workflow'
import { HOUR_MS } from '@/utils/constants/time'

/**
 * Where a member stands against the hours they gave
 * @typedef {'ask' | 'answered' | 'early'} GateState
 */

export type GateState = 'ask' | 'answered' | 'early'

/**
 * Whether the hours given still ask something of the member at the gate
 * @param {Object} live - Viewer's answer on the live
 * @param {string | null} live.myAttendance - Own answer
 * @param {{ from: string, to: string } | null} live.myHours - Hours given
 * @param {Date} now - Moment of arrival
 * @return {GateState} - Ask, hours stand, or arrived before them
 */

export const gateState = (
  live: { myAttendance: string | null; myHours: { from: string; to: string } | null },
  now: Date
): GateState => {
  if (live.myAttendance !== AttendanceStatuses.Present || !live.myHours) return 'ask'
  if (+now < Date.parse(live.myHours.from)) return 'early'

  return +now <= Date.parse(live.myHours.to) ? 'answered' : 'ask'
}

/**
 * End proposed to a member arriving: a round hour a few hours on, or the exact end of a live that stops sooner
 * @param {Date} now - Moment of arrival
 * @param {Date | null} plannedEnd - Planned end of the live
 * @param {number} hoursAhead - Hours proposed
 * @return {Date} - Proposed end
 */

export const suggestedUntil = (now: Date, plannedEnd: Date | null, hoursAhead: number): Date => {
  const hour = HOUR_MS
  const round = new Date(Math.round((+now + hoursAhead * hour) / hour) * hour)

  return plannedEnd && plannedEnd < round ? plannedEnd : round
}
