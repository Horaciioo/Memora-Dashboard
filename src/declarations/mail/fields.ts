import { MAIL_CONSOLE_COPY } from '@/declarations/mail/copy'
import { MAIL_LIMITS } from '@/utils/constants/mail'
import type { FieldDefinition } from '@/types/forms'

/**
 * Field of a trial send
 * @type {FieldDefinition[]}
 */

export const MAIL_TEST_FIELDS: FieldDefinition[] = [
  {
    name: 'to',
    kind: 'text',
    label: MAIL_CONSOLE_COPY.recipientLabel,
    required: true,
    maxLength: MAIL_LIMITS.emailMaxLength,
  },
]
