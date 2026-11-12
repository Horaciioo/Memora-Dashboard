import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { UNBAN_COPY } from '@/declarations/unban/copy'
import { UnbanStatuses, UNBAN_LABEL_MAX_LENGTH } from '@/utils/constants/unban'
import { UNBAN_STATUS_REGISTRY } from '@/declarations/unban/registries'
import type { FieldDefinition } from '@/types/forms'

// Counter every write quotes
export const UNBAN_VERSION_FIELD: FieldDefinition = {
  name: 'version',
  kind: 'number',
  label: UNBAN_COPY.fieldVersion,
  required: true,
  min: 0,
}

/**
 * Fields of the decision
 * @type {FieldDefinition[]}
 */

export const UNBAN_DECISION_FIELDS: FieldDefinition[] = [
  UNBAN_VERSION_FIELD,
  {
    name: 'outcome',
    kind: 'select',
    label: UNBAN_COPY.fieldOutcome,
    required: true,
    options: [UnbanStatuses.Accepted, UnbanStatuses.Refused].map((status) => ({
      value: status,
      label: UNBAN_STATUS_REGISTRY.get(status).label,
    })),
  },
  {
    name: 'reviewNote',
    kind: 'textarea',
    label: UNBAN_COPY.answerToRequester,
    maxLength: UNBAN_SETTINGS.reviewNoteMaxLength,
  },
]

/**
 * Fields of a reopening
 * @type {FieldDefinition[]}
 */

export const UNBAN_REOPEN_FIELDS: FieldDefinition[] = [
  UNBAN_VERSION_FIELD,
  {
    name: 'reason',
    kind: 'textarea',
    label: UNBAN_COPY.reopenReason,
    required: true,
    maxLength: UNBAN_SETTINGS.reviewNoteMaxLength,
  },
]

/**
 * Fields of an assignment
 * @type {FieldDefinition[]}
 */

export const UNBAN_ASSIGN_FIELDS: FieldDefinition[] = [
  UNBAN_VERSION_FIELD,
  { name: 'assigneeId', kind: 'text', label: UNBAN_COPY.fieldAssignee },
]

/**
 * Fields of a new link
 * @type {FieldDefinition[]}
 */

export const UNBAN_LINK_FIELDS: FieldDefinition[] = [
  {
    name: 'youtuberId',
    kind: 'select',
    label: UNBAN_COPY.fieldCreator,
    required: true,
  },
  {
    name: 'expiryDays',
    kind: 'select',
    label: UNBAN_COPY.expiry,
    required: true,
    options: UNBAN_SETTINGS.expiryChoicesDays.map((days) => ({
      value: String(days),
      label: UNBAN_COPY.expiryDays.replace('{days}', String(days)),
    })),
    initial: String(UNBAN_SETTINGS.defaultExpiryDays),
  },
  {
    name: 'expectedDiscordId',
    kind: 'discord',
    label: UNBAN_COPY.expectedDiscordId,
    hint: UNBAN_COPY.expectedDiscordIdHint,
  },
  { name: 'label', kind: 'text', label: UNBAN_COPY.fieldLabel, maxLength: UNBAN_LABEL_MAX_LENGTH },
]
