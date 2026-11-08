import 'server-only'
import { isBehindDeadline } from '@/core/lib/work'
import {
  AUTHORSHIP_INCLUDE,
  toAuthorship,
  toCreatorTags,
  toPerson,
  toProjectTag,
  toTag,
  YOUTUBERS_INCLUDE,
} from '@/core/services/work/shared'
import type { TaskSummary } from '@/types/work'
import { WorkflowPhases } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

// Relations every task card needs
export const TASK_INCLUDE = {
  state: true,
  priority: true,
  youtubers: YOUTUBERS_INCLUDE,
  project: true,
  owner: true,
  ...AUTHORSHIP_INCLUDE,
} satisfies Prisma.TaskInclude

type TaskRow = Prisma.TaskGetPayload<{ include: typeof TASK_INCLUDE }>

/**
 * Map a task row to its card shape
 * @param {TaskRow} row - Task row with its references
 * @return {TaskSummary} - Board card
 */

export const toTaskSummary = (row: TaskRow): TaskSummary => ({
  ...toAuthorship(row),
  id: row.id,
  title: row.title,
  emoji: row.emoji,
  description: row.description,
  columnId: row.stateId,
  state: toTag(row.state),
  priority: toTag(row.priority),
  youtubers: toCreatorTags(row.youtubers),
  project: toProjectTag(row.project),
  owner: toPerson(row.owner),
  dueDate: row.dueDate?.toISOString() ?? null,
  isOverdue: isBehindDeadline(row.dueDate, row.state?.phase),
  isDone: row.state?.phase === WorkflowPhases.Done,
  isSystem: row.systemKey !== null,
  href: row.href,
  position: row.position,
  values: {
    title: row.title,
    emoji: row.emoji,
    description: row.description,
    dueDate: row.dueDate ? row.dueDate.toISOString().slice(0, 10) : null,
    ownerId: row.ownerId,
    stateId: row.stateId,
    priorityId: row.priorityId,
    youtuberIds: row.youtubers.map((youtuber) => youtuber.id),
    projectId: row.projectId,
  },
})
