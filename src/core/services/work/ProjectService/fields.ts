import 'server-only'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import {
  leadOptions,
  memberOptions,
  platformOptions,
  priorityOptions,
  stateOptions,
  youtuberOptions,
} from '@/core/services/work/shared'
import { EMOJI_SETTINGS, FORM_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import { PROJECT_FIELD_COPY, PROJECT_FIELD_INFO } from '@/declarations/work/copy'
import type { FieldDefinition } from '@/types/forms'
import { WorkflowScopes } from '@/utils/constants/workflow'

/**
 * Build the project form declarations
 * @param {AccessScope} [scope] - Creator perimeter
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const projectFields = async (scope?: AccessScope): Promise<FieldDefinition[]> => {
  const [states, priorities, platforms, youtubers, members, leads] = await Promise.all([
    stateOptions(WorkflowScopes.Project),
    priorityOptions(),
    platformOptions(),
    youtuberOptions(scope),
    memberOptions(scope),
    leadOptions(scope),
  ])

  return [
    {
      name: 'emoji',
      kind: 'emoji',
      label: PROJECT_FIELD_COPY.emoji,
      maxLength: EMOJI_SETTINGS.maxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'title',
      kind: 'text',
      label: PROJECT_FIELD_COPY.title,
      info: PROJECT_FIELD_INFO.title,
      required: true,
      glyph: 'emoji',
      maxLength: FORM_SETTINGS.titleMaxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'description',
      kind: 'markdown',
      label: PROJECT_FIELD_COPY.description,
      info: PROJECT_FIELD_INFO.description,
      maxLength: FORM_SETTINGS.markdownMaxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'leadIds',
      kind: 'multiselect',
      label: PROJECT_FIELD_COPY.leads,
      info: PROJECT_FIELD_INFO.leads,
      preset: 'actor',
      placeholder: PROJECT_FIELD_COPY.leadsEmpty,
      options: leads,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'assistantIds',
      kind: 'multiselect',
      label: PROJECT_FIELD_COPY.assistants,
      info: PROJECT_FIELD_INFO.assistants,
      placeholder: PROJECT_FIELD_COPY.assistantsEmpty,
      options: members,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'youtuberIds',
      kind: 'multiselect',
      label: PROJECT_FIELD_COPY.youtubers,
      info: PROJECT_FIELD_INFO.youtubers,
      placeholder: PROJECT_FIELD_COPY.youtubersEmpty,
      options: youtubers,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'stateId',
      kind: 'select',
      label: PROJECT_FIELD_COPY.state,
      info: PROJECT_FIELD_INFO.state,
      preset: 'default',
      options: states,
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.details,
    },
    {
      name: 'priorityId',
      kind: 'select',
      label: PROJECT_FIELD_COPY.priority,
      info: PROJECT_FIELD_INFO.priority,
      preset: 'default',
      options: priorities,
      mark: 'priority',
      span: 'half',
      group: FORM_GROUPS.details,
    },
    {
      name: 'platformId',
      kind: 'select',
      label: PROJECT_FIELD_COPY.platform,
      info: PROJECT_FIELD_INFO.platform,
      options: platforms,
      mark: 'network',
      span: 'half',
      group: FORM_GROUPS.details,
    },
    {
      name: 'deadline',
      kind: 'date',
      label: PROJECT_FIELD_COPY.deadline,
      info: PROJECT_FIELD_INFO.deadline,
      preset: 'today',
      span: 'half',
      group: FORM_GROUPS.details,
    },
  ]
}
