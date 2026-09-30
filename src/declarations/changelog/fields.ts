import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import type { FieldDefinition } from '@/types/forms'

/**
 * Read note payload
 * @type {FieldDefinition[]}
 */

export const SEEN_RELEASE_FIELDS: FieldDefinition[] = [
  {
    name: 'version',
    kind: 'text',
    label: CHANGELOG_COPY.versionField,
    required: true,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
  },
]
