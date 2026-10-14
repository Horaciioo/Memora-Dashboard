import type { ParkourPhase } from '@/core/lib/academy/parkour'
import { milestoneIndex } from '@/core/lib/academy/parkourTimeline'
import type { MilestoneState } from '@/core/lib/academy/parkourTimeline'
import { PARKOUR_MILESTONES } from '@/declarations/academy/timeline'
import type { ParkourMilestone } from '@/declarations/academy/timeline'

/**
 * Junior as the promotion timeline reads them
 * @typedef {Object} PromotionSeat
 * @property {string} id - Junior identifier
 * @property {ParkourPhase} phase - Phase the junior stands in
 * @property {ParkourPhase} progress - Furthest phase reached
 */

export interface PromotionSeat {
  id: string
  phase: ParkourPhase
  progress: ParkourPhase
}

/**
 * Moment of the journey seen from the whole promotion
 * @typedef {Object} PromotionMilestone
 * @property {ParkourMilestone} milestone - Moment declared in code
 * @property {MilestoneState} state - Done for everyone, in course for some, or ahead
 * @property {string[]} here - Juniors standing on it now
 */

export interface PromotionMilestone {
  milestone: ParkourMilestone
  state: MilestoneState
  here: string[]
}

// Phases closing a journey
const ENDED: ParkourPhase[] = ['graduated', 'dismissed', 'resigned']

/**
 * Resolve the journey of a whole promotion
 * @param {PromotionSeat[]} seats - Juniors of the promotion
 * @return {PromotionMilestone[]} - Moments in running order
 */

export const resolvePromotion = (seats: PromotionSeat[]): PromotionMilestone[] => {
  const position = (seat: PromotionSeat) => milestoneIndex(seat.progress)

  return PARKOUR_MILESTONES.flatMap((milestone, index): PromotionMilestone[] => {
    // A 3rd period nobody got to stays out
    if (milestone.optional && !seats.some((seat) => position(seat) >= index)) return []

    const here = seats
      .filter((seat) => !ENDED.includes(seat.phase) && position(seat) === index)
      .map((seat) => seat.id)

    // Behind everyone, or where a journey ended
    const passed =
      seats.length > 0 &&
      seats.every(
        (seat) => position(seat) > index || (ENDED.includes(seat.phase) && position(seat) >= index)
      )

    return [{ milestone, here, state: here.length > 0 ? 'current' : passed ? 'done' : 'upcoming' }]
  })
}
