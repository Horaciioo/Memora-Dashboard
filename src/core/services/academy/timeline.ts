import { StepAnchors } from '@/utils/constants/hierarchy'
import type { StepAnchorName } from '@/utils/constants/hierarchy'
import { isOverdue } from '@/utils/format/dates'

/**
 * Where a timeline step stands, derived and never stored
 * @typedef {'idle' | 'current' | 'done' | 'late'} TimelineStepState
 */

export type TimelineStepState = 'idle' | 'current' | 'done' | 'late'

/**
 * Enough of one AcademyStep to resolve its state
 * @typedef {Object} TimelineStepInput
 * @property {StepAnchorName | null} anchor - Day or live threshold
 * @property {string | Date | null} scheduledAt - Resolved date, day anchor only
 * @property {number | null} offset - Day offset or live threshold
 * @property {string | Date | null} validatedAt - When it was cleared
 */

export interface TimelineStepInput {
  anchor: StepAnchorName | null
  scheduledAt: string | Date | null
  offset: number | null
  validatedAt: string | Date | null
}

/**
 * Where a junior's progress puts them, live anchor only
 * @typedef {Object} TimelineJuniorInput
 * @property {number} liveCount - Lives already covered
 */

export interface TimelineJuniorInput {
  liveCount: number
}

/**
 * Resolve where a timeline step stands, informative only — never an authorisation
 * @param {TimelineStepInput} step - Step being resolved
 * @param {TimelineJuniorInput} junior - Junior it belongs to
 * @param {Date} [now] - Moment to resolve against
 * @return {TimelineStepState} - Resolved state
 */

export const resolveStepState = (
  step: TimelineStepInput,
  junior: TimelineJuniorInput,
  now: Date = new Date()
): TimelineStepState => {
  if (step.validatedAt !== null) return 'done'

  // A live threshold has no calendar deadline, only reached or not
  if (step.anchor === StepAnchors.Live) {
    return step.offset !== null && junior.liveCount >= step.offset ? 'current' : 'idle'
  }

  if (step.scheduledAt === null) return 'idle'
  if (isOverdue(step.scheduledAt)) return 'late'

  return new Date(step.scheduledAt) <= now ? 'current' : 'idle'
}
