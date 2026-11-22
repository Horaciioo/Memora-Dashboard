import type { PresenceTally } from '@/types/academy'
import { AttendanceStatuses, PresenceOutcomes } from '@/utils/constants/workflow'
import type { AttendanceStatusName, PresenceOutcomeName } from '@/utils/constants/workflow'

/**
 * What is known of one junior on one live
 * @typedef {Object} PresenceSignal
 * @property {AttendanceStatusName | null} attendance - Roll-call answer
 * @property {boolean} moderated - Moderation time or a gesture, on Twitch or Memora
 * @property {boolean} onLeave - A declared absence covers the live
 */

export interface PresenceSignal {
  attendance: AttendanceStatusName | null
  moderated: boolean
  onLeave: boolean
}

/**
 * Settle what a live comes to for a junior: a gesture proves they were there whatever they
 * answered, then a declared absence excuses, then the roll-call speaks
 * @param {PresenceSignal} signal - What is known
 * @return {PresenceOutcomeName} - Outcome
 */

export const presenceOutcome = (signal: PresenceSignal): PresenceOutcomeName => {
  if (signal.moderated || signal.attendance === AttendanceStatuses.Present) {
    return PresenceOutcomes.Present
  }
  if (signal.onLeave) return PresenceOutcomes.Excused
  if (signal.attendance === AttendanceStatuses.Absent) return PresenceOutcomes.Absent

  return PresenceOutcomes.Silent
}

/**
 * Count what a junior said about the lives of their period
 * @param {string} juniorId - Junior seat
 * @param {PresenceOutcomeName[]} outcomes - One per live of the period
 * @return {PresenceTally} - Present, absent, silent and excused lives
 */

export const tallyPresences = (
  juniorId: string,
  outcomes: PresenceOutcomeName[]
): PresenceTally => {
  const count = (outcome: PresenceOutcomeName) => outcomes.filter((item) => item === outcome).length

  return {
    juniorId,
    present: count(PresenceOutcomes.Present),
    absent: count(PresenceOutcomes.Absent),
    silent: count(PresenceOutcomes.Silent),
    excused: count(PresenceOutcomes.Excused),
  }
}
