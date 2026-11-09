import 'server-only'
import type { WorkViewer } from '@/core/services/work/visibility'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import {
  memberOptions,
  priorityOptions,
  projectOptions,
  stateOptions,
  youtuberOptions,
} from '@/core/services/work/shared'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import { TASK_FIELD_COPY, TASK_FIELD_INFO } from '@/declarations/work/copy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import { WorkflowScopes } from '@/utils/constants/workflow'

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
