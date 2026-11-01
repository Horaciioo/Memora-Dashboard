import { apiGet, apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { TASK_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/task'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import type { TaskSummary } from '@/types/work'
import { fillTemplate } from '@/utils/format/strings'

/**
 * Way a property is asked
 * @typedef {Object} TaskProp
 * @property {string} key - Field of the task form
 * @property {string} label - Property in words
 * @property {'text' | 'date' | 'select' | 'multi'} kind - How Memora asks it
 * @property {boolean} isClearable - May be left empty
 */

export interface TaskProp {
  key: string
  label: string
  kind: 'text' | 'date' | 'select' | 'multi'
  isClearable: boolean
}

// Every property Memora can change
export const TASK_PROPS: TaskProp[] = [
  { key: 'title', label: COPY.title, kind: 'text', isClearable: false },
  { key: 'description', label: COPY.description, kind: 'text', isClearable: true },
  { key: 'ownerId', label: COPY.ownerId, kind: 'select', isClearable: true },
  { key: 'projectId', label: COPY.projectId, kind: 'select', isClearable: true },
  { key: 'youtuberIds', label: COPY.youtuberIds, kind: 'multi', isClearable: true },
  { key: 'stateId', label: COPY.stateId, kind: 'select', isClearable: false },
  { key: 'priorityId', label: COPY.priorityId, kind: 'select', isClearable: true },
  { key: 'dueDate', label: COPY.dueDate, kind: 'date', isClearable: true },
]

/**
 * A task with the fields its viewer may edit
 * @typedef {Object} TaskFile
 * @property {FieldDefinition[]} fields - Form fields, locked ones read only
 * @property {TaskSummary} task - Task as it is
 */

export interface TaskFile {
  fields: FieldDefinition[]
  task: TaskSummary
}

/**
 * Fresh task and its fields
 * @param {string} id - Task identifier
 * @return {Promise<TaskFile>} - File
 */

export const readTaskFile = (id: string): Promise<TaskFile> =>
  apiGet<TaskFile>(API_ROUTES.taskFile(id))

/**
 * Properties of the form the viewer may change
 * @param {TaskFile} file - Task and fields
 * @return {TaskProp[]} - Editable properties
 */

export const editableProps = (file: TaskFile): TaskProp[] =>
  TASK_PROPS.filter((prop) => {
    const field = file.fields.find((entry) => entry.name === prop.key)

    return field && !field.readOnly
  })

/**
 * Options of one field
 * @param {TaskFile} file - Task and fields
 * @param {string} key - Field name
 * @return {FieldOption[]} - Options one may pick
 */

export const optionsOf = (file: TaskFile, key: string): FieldOption[] =>
  (file.fields.find((field) => field.name === key)?.options ?? []).filter(
    (option) => !option.disabled
  )

/**
 * Write one change, the form replaces everything so the rest is sent back as it is
 * @param {TaskSummary} task - Task before
 * @param {Record<string, unknown>} change - Values replaced
 * @return {Promise<TaskSummary>} - Task after
 */

export const saveChange = (
  task: TaskSummary,
  change: Record<string, unknown>
): Promise<TaskSummary> =>
  apiPatch<TaskSummary>(API_ROUTES.task(task.id), { ...task.values, ...change })

/**
 * Current value of a property, in words
 * @param {TaskSummary} task - Task
 * @param {string} key - Property
 * @return {string} - Spoken value
 */

export const hintOf = (task: TaskSummary, key: string): string => {
  const words: Record<string, string | null | undefined> = {
    title: task.title,
    description: task.description ? COPY.written : null,
    ownerId: task.owner?.name,
    projectId: task.project?.label,
    youtuberIds: task.youtubers.map((creator) => creator.label).join(', '),
    stateId: task.state?.label,
    priorityId: task.priority?.label,
    dueDate: task.dueDate
      ? new Date(task.dueDate).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      : null,
  }

  return words[key] || COPY.empty
}

/**
 * Line asking a text property
 * @param {string} field - Property in words
 * @return {string} - Question
 */

export const textLine = (field: string): string =>
  fillTemplate(COPY.textAsk, { field: field.toLowerCase() })
