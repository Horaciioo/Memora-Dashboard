import type { TimelineState } from '@/components/structures/Timeline'
import type { RecruitmentStepView } from '@/types/recruitment'
import { isOverdue } from '@/utils/format/dates'

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
