import { CALENDAR_FIELD_COPY } from '@/declarations/calendar/copy'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import type { FieldDefinition } from '@/types/forms'

/**
 * Declarations of the meeting request a moderator sends to their responsables
 * @type {FieldDefinition[]}
 */

export const MEETING_REQUEST_FIELDS: FieldDefinition[] = [
  {
    name: 'subject',
    kind: 'text',
    label: CALENDAR_FIELD_COPY.requestSubject,
    required: true,
    maxLength: FORM_SETTINGS.titleMaxLength,
  },
  {
    name: 'day',
    kind: 'date',
    label: CALENDAR_FIELD_COPY.requestDay,
    required: true,
    preset: 'today',
  },
]
