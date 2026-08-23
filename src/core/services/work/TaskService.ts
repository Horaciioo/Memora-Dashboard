import 'server-only'

import { prisma } from '@/core/lib/db'
import { readDate, readText } from '@/core/lib/forms/values'
import {
  defaultState,
  memberOptions,
  positionAt,
  priorityOptions,
  projectOptions,
  stateOptions,
  toPerson,
  toTag,
  youtuberOptions,
} from '@/core/services/work/shared'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import { TASK_FIELD_COPY } from '@/declarations/work/copy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { TaskSummary } from '@/types/work'
import { WorkflowScopes } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

// Relations every task card needs
const TASK_INCLUDE = {
  state: true,
  priority: true,
  youtuber: true,
  project: true,
  owner: true,
} satisfies Prisma.TaskInclude

type TaskRow = Prisma.TaskGetPayload<{ include: typeof TASK_INCLUDE }>

/**
 * Map a task row to its card shape
 * @param {TaskRow} row - Task row with its references
 * @return {TaskSummary} - Board card
 */

const toSummary = (row: TaskRow): TaskSummary => ({
  id: row.id,
  title: row.title,
  description: row.description,
  columnId: row.stateId,
  state: toTag(row.state),
  priority: toTag(row.priority),
  youtuber: toTag(row.youtuber),
  project: row.project ? { id: row.project.id, label: row.project.title, accent: null } : null,
  owner: toPerson(row.owner),
  dueDate: row.dueDate?.toISOString() ?? null,
  position: row.position,
  values: {
    title: row.title,
    description: row.description,
    dueDate: row.dueDate ? row.dueDate.toISOString().slice(0, 10) : null,
    ownerId: row.ownerId,
    stateId: row.stateId,
    priorityId: row.priorityId,
    youtuberId: row.youtuberId,
    projectId: row.projectId,
  },
})

/**
 * Build the task form declarations
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const taskFields = async (): Promise<FieldDefinition[]> => {
  const [states, priorities, youtubers, projects, members] = await Promise.all([
    stateOptions(WorkflowScopes.Task),
    priorityOptions(),
    youtuberOptions(),
    projectOptions(),
    memberOptions(),
  ])

  return [
    {
      name: 'title',
      kind: 'text',
      label: TASK_FIELD_COPY.title,
      required: true,
      maxLength: FORM_SETTINGS.titleMaxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'description',
      kind: 'textarea',
      label: TASK_FIELD_COPY.description,
      maxLength: FORM_SETTINGS.longTextMaxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'ownerId',
      kind: 'select',
      label: TASK_FIELD_COPY.owner,
      options: members,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'projectId',
      kind: 'select',
      label: TASK_FIELD_COPY.project,
      options: projects,
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'youtuberId',
      kind: 'select',
      label: TASK_FIELD_COPY.youtuber,
      options: youtubers,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'stateId',
      kind: 'select',
      label: TASK_FIELD_COPY.state,
      options: states,
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.details,
    },
    {
      name: 'priorityId',
      kind: 'select',
      label: TASK_FIELD_COPY.priority,
      options: priorities,
      mark: 'priority',
      span: 'half',
      group: FORM_GROUPS.details,
    },
    {
      name: 'dueDate',
      kind: 'date',
      label: TASK_FIELD_COPY.dueDate,
      span: 'half',
      group: FORM_GROUPS.details,
    },
  ]
}

/**
 * Read every task
 * @return {Promise<TaskSummary[]>} - Board cards
 */

export const listTasks = async (): Promise<TaskSummary[]> => {
  const rows = await prisma.task.findMany({
    where: { archived: false },
    include: TASK_INCLUDE,
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  })

  return rows.map(toSummary)
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
  youtuberId: readText(values, 'youtuberId'),
  projectId: readText(values, 'projectId'),
})

/**
 * Add a task
 * @param {FormValues} values - Parsed body
 * @return {Promise<TaskSummary>} - Created card
 */

export const createTask = async (values: FormValues): Promise<TaskSummary> => {
  const data = toTaskData(values)
  const stateId = data.stateId ?? (await defaultState(WorkflowScopes.Task))

  // A new card lands at the bottom of its column
  const last = await prisma.task.aggregate({ where: { stateId }, _max: { position: true } })

  const row = await prisma.task.create({
    data: { ...data, stateId, position: (last._max.position ?? 0) + FORM_SETTINGS.positionStep },
    include: TASK_INCLUDE,
  })

  return toSummary(row)
}

/**
 * Edit a task
 * @param {string} id - Task identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<TaskSummary>} - Updated card
 */

export const updateTask = async (id: string, values: FormValues): Promise<TaskSummary> => {
  const row = await prisma.task.update({
    where: { id },
    data: toTaskData(values),
    include: TASK_INCLUDE,
  })

  return toSummary(row)
}

/**
 * Drop a task
 * @param {string} id - Task identifier
 * @return {Promise<void>} - Removed
 */

export const removeTask = async (id: string): Promise<void> => {
  await prisma.task.delete({ where: { id } })
}

/**
 * Move a task card
 * @param {string} id - Task identifier
 * @param {string} stateId - Target column
 * @param {number} index - Drop index
 * @return {Promise<TaskSummary>} - Moved card
 */

export const moveTask = async (
  id: string,
  stateId: string,
  index: number
): Promise<TaskSummary> => {
  const cards = await prisma.task.findMany({
    where: { stateId, archived: false, id: { not: id } },
    select: { id: true, position: true },
    orderBy: { position: 'asc' },
  })

  const row = await prisma.task.update({
    where: { id },
    data: { stateId, position: positionAt(cards, index) },
    include: TASK_INCLUDE,
  })

  return toSummary(row)
}
