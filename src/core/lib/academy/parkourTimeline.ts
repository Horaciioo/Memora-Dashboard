import type { ParkourPhase } from '@/core/lib/academy/parkour'
import { PARKOUR_ENDINGS, PARKOUR_MILESTONES } from '@/declarations/academy/timeline'
import type { ParkourMilestone, PimPeriodName } from '@/declarations/academy/timeline'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Where a moment stands for one junior
 * @typedef {'done' | 'current' | 'upcoming' | 'late'} MilestoneState
 */

export type MilestoneState = 'done' | 'current' | 'upcoming' | 'late'

/**
 * Moment of the journey resolved for one junior
 * @typedef {Object} MilestoneView
 * @property {string} key - Stable identifier
 * @property {PimPeriodName} period - Stretch it belongs to
 * @property {IconName} icon - Glyph
 * @property {string} label - Moment name
 * @property {string} lead - What happens
 * @property {ParkourMilestone['owner']} owner - Who moves it forward
 * @property {ParkourMilestone['destination']} destination - Where its owner acts
 * @property {MilestoneState} state - Where it stands
 */

export interface MilestoneView {
  key: string
  period: PimPeriodName
  icon: IconName
  label: string
  lead: string
  owner: ParkourMilestone['owner']
  destination: ParkourMilestone['destination']
  state: MilestoneState
}

// Phases closing the journey
const ENDED_PHASES: ParkourPhase[] = ['graduated', 'dismissed', 'resigned']

// Phases closing it badly
const FAILED_PHASES: ParkourPhase[] = ['dismissed', 'resigned']

/**
 * Position of a phase on the journey
 * @param {ParkourPhase} phase - Phase looked for
 * @return {number} - Index of the moment in course
 */

export const milestoneIndex = (phase: ParkourPhase): number =>
  PARKOUR_MILESTONES.findIndex((milestone) => milestone.phases.includes(phase))

/**
 * Resolve the journey of one junior
 * @param {ParkourPhase} phase - Phase the junior stands in
 * @param {ParkourPhase} progress - Phase reached, whatever the outcome
 * @param {(phase: ParkourPhase) => string} leadOf - Sentence of the moment in course
 * @return {MilestoneView[]} - Moments in running order
 */

export const resolveJourney = (
  phase: ParkourPhase,
  progress: ParkourPhase,
  leadOf: (phase: ParkourPhase) => string
): MilestoneView[] => {
  const ended = ENDED_PHASES.includes(phase)
  const failed = FAILED_PHASES.includes(phase)
  const reached = milestoneIndex(progress)
  const ending = PARKOUR_ENDINGS[phase]

  return PARKOUR_MILESTONES.flatMap((milestone, index): MilestoneView[] => {
    const isOutcome = milestone.phases.includes(phase)

    // What a journey that ended never reached stays out
    if (failed && !isOutcome && index > reached) return []
    if (milestone.optional && ended && index > reached) return []

    const state: MilestoneState =
      isOutcome && failed
        ? 'late'
        : phase === 'graduated' || index < reached
          ? 'done'
          : index === reached
            ? failed
              ? 'done'
              : 'current'
            : 'upcoming'

    const outcome = isOutcome && failed ? ending : undefined

    return [
      {
        key: milestone.key,
        period: milestone.period,
        icon: outcome?.icon ?? milestone.icon,
        label: outcome?.label ?? milestone.label,
        lead: outcome?.lead ?? (state === 'current' ? leadOf(phase) : milestone.lead),
        owner: milestone.owner,
        destination: milestone.destination,
        state,
      },
    ]
  })
}
