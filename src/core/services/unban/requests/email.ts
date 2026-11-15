import { invalidInput } from '@/core/lib/errors'
import { UNBAN_PUBLIC_COPY } from '@/declarations/unban/copy'
import { EMAIL_PATTERN, MAIL_LIMITS } from '@/utils/constants/mail'
import { UNBAN_FORM_FIELDS } from '@/utils/constants/unban'

/**
 * Address the person typed to be written to, refused when it cannot be one
 * @param {Record<string, unknown>} reserved - Reserved fields of the body
 * @return {string} - Clean address
 */

export const readEmail = (reserved: Record<string, unknown>): string => {
  const email = String(reserved[UNBAN_FORM_FIELDS.email] ?? '')
    .trim()
    .toLowerCase()

  if (email.length > MAIL_LIMITS.emailMaxLength || !EMAIL_PATTERN.test(email)) {
    throw invalidInput([{ field: UNBAN_FORM_FIELDS.email, message: UNBAN_PUBLIC_COPY.badEmail }])
  }

  return email
}
