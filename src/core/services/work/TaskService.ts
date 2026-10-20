import 'server-only'

import { prisma } from '@/core/lib/db'
import { assertAllInScope, assertRowInScope, scopedWhere } from '@/core/services/auth/ScopeService'
import { taskVisibility } from '@/core/services/work/visibility'
import type { WorkViewer } from '@/core/services/work/visibility'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { forbidden, notFound } from '@/core/lib/errors'
import { readDate, readText } from '@/core/lib/forms/values'
import { isBehindDeadline } from '@/core/lib/work'
import {
  AUTHORSHIP_INCLUDE,
  creatorLinks,
  defaultState,
  keptCreatorIds,
  memberOptions,
  positionAt,
  priorityOptions,
  projectOptions,
  readCreatorIds,
  stateOptions,
  toAuthorship,
  toCreatorTags,
  toPerson,
  toProjectTag,
  toTag,
  youtuberOptions,
  YOUTUBERS_INCLUDE,
} from '@/core/services/work/shared'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import { TASK_FIELD_COPY, TASK_FIELD_INFO } from '@/declarations/work/copy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { TaskSummary } from '@/types/work'
import { WorkflowPhases, WorkflowScopes } from '@/utils/constants/workflow'
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

/**
 * Build the task form declarations
 * @param {AccessScope} [scope] - Creator perimeter
 * @param {WorkViewer} [viewer] - Who reads
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const taskFields = async (
  scope?: AccessScope,
  viewer?: WorkViewer
): Promise<FieldDefinition[]> => {
  const [states, priorities, youtubers, projects, members] = await Promise.all([
    stateOptions(WorkflowScopes.Task),
    priorityOptions(),
    youtuberOptions(scope),
    projectOptions(scope, viewer),
    memberOptions(scope),
  ])

  return [
    {
      name: 'title',
      kind: 'text',
      label: TASK_FIELD_COPY.title,
      info: TASK_FIELD_INFO.title,
      required: true,
      maxLength: FORM_SETTINGS.titleMaxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'description',
      kind: 'markdown',
      label: TASK_FIELD_COPY.description,
      info: TASK_FIELD_INFO.description,
      maxLength: FORM_SETTINGS.markdownMaxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'ownerId',
      kind: 'select',
      label: TASK_FIELD_COPY.owner,
      info: TASK_FIELD_INFO.owner,
      preset: 'actor',
      options: members,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'projectId',
      kind: 'select',
      mark: 'emoji',
      label: TASK_FIELD_COPY.project,
      info: TASK_FIELD_INFO.project,
      options: projects,
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'youtuberIds',
      kind: 'multiselect',
      label: TASK_FIELD_COPY.youtubers,
      info: TASK_FIELD_INFO.youtubers,
      placeholder: TASK_FIELD_COPY.youtubersEmpty,
      options: youtubers,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'stateId',
      kind: 'select',
      label: TASK_FIELD_COPY.state,
      info: TASK_FIELD_INFO.state,
      preset: 'default',
      options: states,
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.details,
    },
    {
      name: 'priorityId',
      kind: 'select',
      label: TASK_FIELD_COPY.priority,
      info: TASK_FIELD_INFO.priority,
      preset: 'default',
      options: priorities,
      mark: 'priority',
      span: 'half',
      group: FORM_GROUPS.details,
    },
    {
      name: 'dueDate',
      kind: 'date',
      label: TASK_FIELD_COPY.dueDate,
      info: TASK_FIELD_INFO.dueDate,
      preset: 'today',
      span: 'half',
      group: FORM_GROUPS.details,
    },
  ]
}

// Fields only a manager moves
const MANAGED_FIELDS = ['ownerId', 'stateId', 'dueDate'] as const

/**
 * Pin the fields a member cannot move
 * @param {FormValues} values - Parsed body
 * @param {FormValues} [current] - Stored values
 * @return {FormValues} - Safe values
 */

export const lockTaskValues = (values: FormValues, current?: FormValues): FormValues => {
  const locked = { ...values }

  // Keep stored, or let defaults land
  for (const name of MANAGED_FIELDS) {
    if (current && name in current) locked[name] = current[name]
    else delete locked[name]
  }

  return locked
}

/**
 * Show the managed fields read-only
 * @param {FieldDefinition[]} fields - Task form
 * @return {FieldDefinition[]} - Locked form
 */

export const lockTaskFields = (fields: FieldDefinition[]): FieldDefinition[] =>
  fields.map((field) =>
    (MANAGED_FIELDS as readonly string[]).includes(field.name)
      ? { ...field, readOnly: true }
      : field
  )

/**
 * Drop the managed fields from a creation form
 * @param {FieldDefinition[]} fields - Task form
 * @return {FieldDefinition[]} - Form without them
 */

export const creatableTaskFields = (fields: FieldDefinition[]): FieldDefinition[] =>
  fields.filter((field) => !(MANAGED_FIELDS as readonly string[]).includes(field.name))

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
