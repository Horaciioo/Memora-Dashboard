import { WorkflowPhases } from '@/utils/constants/workflow'
import type { WorkflowPhaseName } from '@/utils/constants/workflow'
import { isOverdue } from '@/utils/format/dates'

/**
 * Column holding the day a work item is due
 * @typedef {'deadline' | 'dueDate' | 'scheduledAt'} DueColumn
 */

export type DueColumn = 'deadline' | 'dueDate' | 'scheduledAt'

/**
 * Check a work item left behind its deadline
 * @param {Date | null} due - Day it is due
 * @param {WorkflowPhaseName | null} [phase] - Lifecycle bucket of its state
 * @return {boolean} - Late and not done
 */

export const isBehindDeadline = (due: Date | null, phase?: WorkflowPhaseName | null): boolean =>
  due !== null && phase !== WorkflowPhases.Done && isOverdue(due)

// State missing or not finished
type NotDone = { stateId: null } | { state: { is: { phase: { not: typeof WorkflowPhases.Done } } } }

/**
 * Filter the work items left behind their deadline
 * @param {DueColumn} column - Column holding the due day
 * @return {object} - Where clause
 */

export const behindDeadlineWhere = <TColumn extends DueColumn>(column: TColumn) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return {
    [column]: { lt: today },
    OR: [{ stateId: null }, { state: { is: { phase: { not: WorkflowPhases.Done } } } }],
  } as Record<TColumn, { lt: Date }> & { OR: NotDone[] }
}
