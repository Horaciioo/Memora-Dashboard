import { COMMENT_COPY } from '@/declarations/ui/copy/comments'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import type { FieldDefinition } from '@/types/forms'

/**
 * Declarations of the remark form
 * @return {FieldDefinition[]} - Field declarations
 */

export const commentFields = (): FieldDefinition[] => [
  {
    name: 'body',
    kind: 'textarea',
    label: COMMENT_COPY.field,
    required: true,
    maxLength: FORM_SETTINGS.noteMaxLength,
  },
]
