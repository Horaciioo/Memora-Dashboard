import 'server-only'
import { prisma } from '@/core/lib/db'
import { assertAllInScope, assertRowInScope, scopedWhere } from '@/core/services/auth/ScopeService'
import { taskVisibility } from '@/core/services/work/visibility'
import type { WorkViewer } from '@/core/services/work/visibility'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { forbidden, notFound } from '@/core/lib/errors'
import { readDate, readText } from '@/core/lib/forms/values'
import {
  creatorLinks,
  defaultState,
  keptCreatorIds,
  positionAt,
  readCreatorIds,
} from '@/core/services/work/shared'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import type { FormValues } from '@/types/forms'
import type { TaskSummary } from '@/types/work'
import { WorkflowPhases, WorkflowScopes } from '@/utils/constants/workflow'
import { TASK_INCLUDE, toTaskSummary } from '@/core/services/work/TaskService/shape'

/**
 * Read every task
 * @param {AccessScope} scope - Creator perimeter
 * @param {WorkViewer} viewer - Who reads
 * @return {Promise<TaskSummary[]>} - Board cards
 */

export const listTasks = async (scope: AccessScope, viewer: WorkViewer): Promise<TaskSummary[]> => {
  const rows = await prisma.task.findMany({
    where: { AND: [scopedWhere('task', scope, { archived: false }), taskVisibility(viewer)] },
    include: TASK_INCLUDE,
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  })

  return rows.map(toTaskSummary)
}

/**
 * Read one task file
 * @param {string} id - Task identifier
 * @return {Promise<TaskSummary>} - Full file
 */

export const readTask = async (id: string): Promise<TaskSummary> => {
  const row = await prisma.task.findUnique({ where: { id }, include: TASK_INCLUDE })
  if (!row) throw notFound()

  return toTaskSummary(row)
}

/**
 * Turn parsed values into a database payload
 * @param {FormValues} values - Parsed body
 * @return {Prisma.TaskUncheckedUpdateInput} - Database payload
 */

const toTaskData = (values: FormValues) => ({
  title: readText(values, 'title') ?? '',
  description: readText(values, 'description'),
  dueDate: readDate(values, 'dueDate'),
  ownerId: readText(values, 'ownerId'),
  stateId: readText(values, 'stateId'),
  priorityId: readText(values, 'priorityId'),
  projectId: readText(values, 'projectId'),
})

/**
 * Add a task
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} actorId - Who opened it
 * @return {Promise<TaskSummary>} - Created card
 */

export const createTask = async (
  values: FormValues,
  scope: AccessScope,
  actorId: string
): Promise<TaskSummary> => {
  const data = toTaskData(values)
  const youtuberIds = readCreatorIds(values)
  assertAllInScope(scope, youtuberIds)

  const stateId = data.stateId ?? (await defaultState(WorkflowScopes.Task))

  // A new card lands at the bottom of its column
  const last = await prisma.task.aggregate({ where: { stateId }, _max: { position: true } })

  const row = await prisma.task.create({
    data: {
      ...data,
      stateId,
      youtubers: { connect: creatorLinks(youtuberIds) },
      position: (last._max.position ?? 0) + FORM_SETTINGS.positionStep,
      createdById: actorId,
      updatedById: actorId,
    },
    include: TASK_INCLUDE,
  })

  return toTaskSummary(row)
}

/**
 * Edit a task
 * @param {string} id - Task identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} actorId - Who edited it
 * @return {Promise<TaskSummary>} - Updated card
 */

export const updateTask = async (
  id: string,
  values: FormValues,
  scope: AccessScope,
  actorId: string
): Promise<TaskSummary> => {
  await assertRowInScope('task', id, scope)

  // The system keeps its own tasks, only their state moves
  const owned = await prisma.task.findUnique({ where: { id }, select: { systemKey: true } })
  if (owned?.systemKey) {
    const kept = await prisma.task.update({
      where: { id },
      data: { stateId: readText(values, 'stateId'), updatedById: actorId },
      include: TASK_INCLUDE,
    })

    return toTaskSummary(kept)
  }

  const picked = readCreatorIds(values)
  assertAllInScope(scope, picked)

  const stored = await prisma.task.findUnique({
    where: { id },
    select: { youtubers: { select: { id: true } } },
  })

  const row = await prisma.task.update({
    where: { id },
    data: {
      ...toTaskData(values),
      updatedById: actorId,
      youtubers: {
        set: creatorLinks(
          keptCreatorIds(
            picked,
            scope,
            stored?.youtubers.map((youtuber) => youtuber.id)
          )
        ),
      },
    },
    include: TASK_INCLUDE,
  })

  return toTaskSummary(row)
}

/**
 * Drop a task
 * @param {string} id - Task identifier
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<void>} - Removed
 */

export const removeTask = async (id: string, scope: AccessScope): Promise<void> => {
  await assertRowInScope('task', id, scope)
  await assertHandMade(id)

  await prisma.task.delete({ where: { id } })
}

/**
 * Move a task card
 * @param {string} id - Task identifier
 * @param {string} stateId - Target column
 * @param {number} index - Drop index
 * @param {string} actorId - Who moved it
 * @return {Promise<TaskSummary>} - Moved card
 */

export const moveTask = async (
  id: string,
  stateId: string,
  index: number,
  actorId: string
): Promise<TaskSummary> => {
  const cards = await prisma.task.findMany({
    where: { stateId, archived: false, id: { not: id } },
    select: { id: true, position: true },
    orderBy: { position: 'asc' },
  })

  const row = await prisma.task.update({
    where: { id },
    data: { stateId, position: positionAt(cards, index), updatedById: actorId },
    include: TASK_INCLUDE,
  })

  return toTaskSummary(row)
}

/**
 * Refuse a task the system keeps by itself
 * @param {string} id - Task identifier
 * @return {Promise<void>} - Throws when the system owns it
 */

export const assertHandMade = async (id: string): Promise<void> => {
  const row = await prisma.task.findUnique({ where: { id }, select: { systemKey: true } })
  if (row?.systemKey) throw forbidden()
}

/**
 * Tick a task done, or put it back to do
 * @param {string} id - Task identifier
 * @param {boolean} done - Wanted outcome
 * @param {string} actorId - Who ticked it
 * @return {Promise<TaskSummary>} - Updated card
 */

export const setTaskDone = async (
  id: string,
  done: boolean,
  actorId: string
): Promise<TaskSummary> => {
  const states = await prisma.workflowState.findMany({
    where: { scope: WorkflowScopes.Task },
    orderBy: { position: 'asc' },
  })
  const target = done
    ? states.find((state) => state.phase === WorkflowPhases.Done)
    : (states.find((state) => state.isDefault && state.phase !== WorkflowPhases.Done) ??
      states.find((state) => state.phase !== WorkflowPhases.Done))
  if (!target) throw notFound()

  const last = await prisma.task.aggregate({
    where: { stateId: target.id },
    _max: { position: true },
  })

  const row = await prisma.task.update({
    where: { id },
    data: {
      stateId: target.id,
      position: (last._max.position ?? 0) + FORM_SETTINGS.positionStep,
      updatedById: actorId,
    },
    include: TASK_INCLUDE,
  })

  return toTaskSummary(row)
}
