import type { TimelineState } from '@/components/structures/data/Timeline'
import type { RecruitmentStepView } from '@/types/recruitment'
import { isOverdue } from '@/utils/format/dates'

// Order every list of steps is read in
export const STEP_ORDER = [{ offset: 'asc' }, { position: 'asc' }] as const

/**
 * Whether a step may change state without skipping one, only the next is cleared and only the last reopens
 * @param {{ id: string; doneAt: string | Date | null }[]} steps - Timeline in order
 * @param {string} id - Step moved
 * @param {boolean} done - Wanted state
 * @return {boolean} - True when the sequence stays unbroken
 */

export const canMoveStep = (
  steps: { id: string; doneAt: string | Date | null }[],
  id: string,
  done: boolean
): boolean => {
  const index = steps.findIndex((step) => step.id === id)
  if (index < 0) return false

  return done
    ? steps.slice(0, index).every((step) => step.doneAt)
    : steps.slice(index + 1).every((step) => !step.doneAt)
}

/**
 * Where a session step stands
 * @param {RecruitmentStepView} step - Timeline moment
 * @param {string | undefined} nextId - First step not yet cleared
 * @return {TimelineState} - Done, late, current or upcoming
 */

export const stepState = (step: RecruitmentStepView, nextId: string | undefined): TimelineState => {
  if (step.doneAt) return 'done'
  if (isOverdue(step.scheduledAt)) return 'late'

  return step.id === nextId ? 'current' : 'upcoming'
}
