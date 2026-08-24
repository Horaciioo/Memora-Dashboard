import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createPublicRoute } from '@/core/lib/http/route'
import {
  admissionFields,
  resolveInvite,
  submitAdmission,
} from '@/core/services/academy/AdmissionService'
import { recordEvent } from '@/core/services/system/ActivityService'

export const POST = createPublicRoute({
  status: 201,
  descriptor: { summary: 'Submit an admission application', tags: ['academy'] },
  handler: async ({ params, raw }) => {
    const invite = await resolveInvite(params.token)
    const parsed = parseFormValues(await admissionFields(invite), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const { accountId, displayName, sessionId } = await submitAdmission(params.token, parsed.values)

    await recordEvent({
      eventType: 'JuniorEnrolled',
      actorId: accountId,
      subjectId: accountId,
      targetType: 'academy-session',
      targetId: sessionId,
      summary: displayName,
    })

    return { ok: true }
  },
})
