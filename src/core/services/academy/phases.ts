import { resolvePhase } from '@/core/lib/academy/parkour'
import type { ParkourJunior, ParkourPhase, ParkourSession } from '@/core/lib/academy/parkour'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import type {
  AcademyJuniorStatusName,
  AcademySessionStatusName,
  AcademyStageName,
  ReviewStatusName,
} from '@/utils/constants/hierarchy'
import { AcademyJuniorStatuses } from '@/utils/constants/hierarchy'

// Lives thresholds
export const thresholds = () => ({
  firstPeriodLives: ACADEMY_SETTINGS.firstPeriodLives,
  secondPeriodLives: ACADEMY_SETTINGS.secondPeriodLives,
})

/**
 * Read a junior row the way the parkour reasons about it
 * @param {Object} row - Junior row with its reviews
 * @return {ParkourJunior} - Parkour junior
 */

export const toParkourJunior = (row: {
  status: string
  stage: string
  trainerId: string | null
  kickoffAt: Date | null
  confirmedAt: Date | null
  liveCount: number
  deadlineAt: Date | null
  reviews: { stage: string; status: string }[]
}): ParkourJunior => ({
  status: row.status as AcademyJuniorStatusName,
  stage: row.stage as AcademyStageName,
  trainerId: row.trainerId,
  kickoffAt: row.kickoffAt,
  confirmedAt: row.confirmedAt,
  liveCount: row.liveCount,
  deadlineAt: row.deadlineAt,
  reviews: row.reviews.map((review) => ({
    stage: review.stage as AcademyStageName,
    status: review.status as ReviewStatusName,
  })),
})

/**
 * Read a promotion row the way the parkour reasons about it
 * @param {{ status: string, secondPeriodAt: Date | null }} session - Promotion row
 * @return {ParkourSession} - Parkour promotion
 */

export const toParkourSession = (session: {
  status: string
  secondPeriodAt: Date | null
}): ParkourSession => ({
  status: session.status as AcademySessionStatusName,
  secondPeriodAt: session.secondPeriodAt,
})

/**
 * Phase of a junior and the one they reached, whatever the outcome
 * @param {Parameters<typeof toParkourJunior>[0]} junior - Junior row with its reviews
 * @param {{ status: string, secondPeriodAt: Date | null }} session - Promotion row
 * @return {{ phase: ParkourPhase, progress: ParkourPhase }} - Both phases
 */

export const resolveBoth = (
  junior: Parameters<typeof toParkourJunior>[0],
  session: { status: string; secondPeriodAt: Date | null }
): { phase: ParkourPhase; progress: ParkourPhase } => {
  const parkour = toParkourJunior(junior)
  const promotion = toParkourSession(session)

  return {
    phase: resolvePhase(parkour, promotion),
    // Where the journey stood before it ended
    progress: resolvePhase({ ...parkour, status: AcademyJuniorStatuses.Active }, promotion),
  }
}
