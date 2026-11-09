import 'server-only'
import type { WorkViewer } from '@/core/services/work/visibility'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import {
  memberOptions,
  projectOptions,
  stateOptions,
  youtuberOptions,
} from '@/core/services/work/shared'
import { EMOJI_SETTINGS, FORM_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import { MEETING_FIELD_COPY, MEETING_FIELD_INFO } from '@/declarations/work/copy'
import { MEETING_AUDIENCE_REGISTRY } from '@/declarations/work/registries'
import { toOptions } from '@/core/lib/forms/options'
import type { FieldDefinition } from '@/types/forms'
import { MeetingAudiences, WorkflowScopes } from '@/utils/constants/workflow'

/**
 * Build the meeting form declarations
 * @param {AccessScope} [scope] - Creator perimeter
 * @param {WorkViewer} [viewer] - Who reads
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const meetingFields = async (
  scope?: AccessScope,
  viewer?: WorkViewer
): Promise<FieldDefinition[]> => {
  const [states, youtubers, projects, members] = await Promise.all([
    stateOptions(WorkflowScopes.Meeting),
    youtuberOptions(scope),
    projectOptions(scope, viewer),
    memberOptions(scope),
  ])

  return [
    {
      name: 'emoji',
      kind: 'emoji',
      label: MEETING_FIELD_COPY.emoji,
      maxLength: EMOJI_SETTINGS.maxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'title',
      kind: 'text',
      label: MEETING_FIELD_COPY.title,
      info: MEETING_FIELD_INFO.title,
      required: true,
      glyph: 'emoji',
      maxLength: FORM_SETTINGS.titleMaxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'youtuberIds',
      kind: 'multiselect',
      label: MEETING_FIELD_COPY.youtubers,
      info: MEETING_FIELD_INFO.youtubers,
      placeholder: MEETING_FIELD_COPY.youtubersEmpty,
      preset: 'default',
      // The creator the member is viewing leads
      options: youtubers.map((option) => ({
        ...option,
        isDefault: option.value === scope?.activeYoutuberId,
      })),
      mark: 'avatar',
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'scheduledAt',
      kind: 'datetime',
      label: MEETING_FIELD_COPY.scheduledAt,
      info: MEETING_FIELD_INFO.scheduledAt,
      span: 'half',
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'durationMin',
      kind: 'number',
      label: MEETING_FIELD_COPY.durationMin,
      info: MEETING_FIELD_INFO.durationMin,
      min: FORM_SETTINGS.meetingMinDuration,
      max: FORM_SETTINGS.meetingMaxDuration,
      span: 'half',
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'audience',
      kind: 'select',
      label: MEETING_FIELD_COPY.audience,
      info: MEETING_FIELD_INFO.audience,
      required: true,
      preset: 'default',
      options: toOptions(MEETING_AUDIENCE_REGISTRY).map((option) => ({
        ...option,
        isDefault: option.value === MeetingAudiences.Custom,
      })),
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'leadIds',
      kind: 'multiselect',
      preset: 'actor',
      label: MEETING_FIELD_COPY.leads,
      info: MEETING_FIELD_INFO.leads,
      placeholder: MEETING_FIELD_COPY.peopleEmpty,
      options: members,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'assistantIds',
      kind: 'multiselect',
      label: MEETING_FIELD_COPY.assistants,
      info: MEETING_FIELD_INFO.assistants,
      placeholder: MEETING_FIELD_COPY.peopleEmpty,
      options: members,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'participantIds',
      kind: 'multiselect',
      label: MEETING_FIELD_COPY.participants,
      info: MEETING_FIELD_INFO.participants,
      placeholder: MEETING_FIELD_COPY.peopleEmpty,
      options: members,
      mark: 'avatar',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'projectId',
      kind: 'select',
      mark: 'emoji',
      label: MEETING_FIELD_COPY.project,
      info: MEETING_FIELD_INFO.project,
      options: projects,
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'stateId',
      kind: 'select',
      label: MEETING_FIELD_COPY.state,
      info: MEETING_FIELD_INFO.state,
      preset: 'default',
      options: states,
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.details,
    },
    {
      name: 'introduction',
      kind: 'markdown',
      label: MEETING_FIELD_COPY.introduction,
      info: MEETING_FIELD_INFO.introduction,
      maxLength: FORM_SETTINGS.markdownMaxLength,
      group: FORM_GROUPS.details,
    },
    {
      name: 'outro',
      kind: 'markdown',
      label: MEETING_FIELD_COPY.outro,
      info: MEETING_FIELD_INFO.outro,
      maxLength: FORM_SETTINGS.markdownMaxLength,
      group: FORM_GROUPS.details,
    },
    {
      name: 'minutes',
      kind: 'markdown',
      label: MEETING_FIELD_COPY.minutes,
      info: MEETING_FIELD_INFO.minutes,
      maxLength: FORM_SETTINGS.markdownMaxLength,
      group: FORM_GROUPS.details,
    },
  ]
}
