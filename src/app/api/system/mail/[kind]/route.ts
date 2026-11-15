import { forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { readRequiredText } from '@/core/lib/forms/values'
import { createProtectedRoute } from '@/core/lib/http/route'
import { sendTrialMail } from '@/core/services/mail/TrialService'
import { MAIL_CONSOLE_COPY, MAIL_TEMPLATES } from '@/declarations/mail/copy'
import { MAIL_TEST_FIELDS } from '@/declarations/mail/fields'
import { EMAIL_PATTERN } from '@/utils/constants/mail'
import type { MailKindName } from '@/utils/constants/mail'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AccessManage,
  rateLimit: 'lookup',
  fields: MAIL_TEST_FIELDS,
  descriptor: { summary: 'Send one catalogue mail to an address', tags: ['system'] },
  handler: async ({ params, body, access }) => {
    // System holders only
    if (!access.isSystem) throw forbidden()
    if (!(params.kind in MAIL_TEMPLATES)) throw notFound()

    const to = readRequiredText(body, 'to').toLowerCase()
    if (!EMAIL_PATTERN.test(to)) {
      throw invalidInput([{ field: 'to', message: MAIL_CONSOLE_COPY.badAddress }])
    }

    const result = await sendTrialMail(params.kind as MailKindName, to)
    if (result.status !== 'SENT') {
      throw invalidInput([{ field: 'to', message: result.detail ?? MAIL_CONSOLE_COPY.sendFailed }])
    }

    return { sent: true }
  },
})
