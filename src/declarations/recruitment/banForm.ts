import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { RECRUITMENT_FIELD_COPY } from '@/declarations/recruitment/copy'
import { HISTORY_COPY } from '@/declarations/recruitment/historyCopy'
import type { FieldDefinition } from '@/types/forms'

/**
 * Blacklist form, the identifiers travel with the reason
 * @type {FieldDefinition[]}
 */

export const BAN_FIELDS: FieldDefinition[] = [
  { name: 'discordId', kind: 'discord', label: RECRUITMENT_FIELD_COPY.discordId, required: true },
  {
    name: 'sessionId',
    kind: 'text',
    label: HISTORY_COPY.tabSessions,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
  },
  {
    name: 'candidateId',
    kind: 'text',
    label: HISTORY_COPY.tabSessions,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
  },
  {
    name: 'reason',
    kind: 'textarea',
    label: HISTORY_COPY.reason,
    info: HISTORY_COPY.reasonInfo,
    maxLength: FORM_SETTINGS.noteMaxLength,
  },
]

// Fields the person fills in
export const BAN_DRAWER_FIELDS = BAN_FIELDS.filter((field) => field.name === 'reason')
