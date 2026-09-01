import { cookies } from 'next/headers'

import { INTEGRATION_TICKET_COOKIE, unpackTicket } from '@/core/lib/auth/integrationTicket'
import { invalidInput, notFound } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createPublicRoute } from '@/core/lib/http/route'
import {
  integrationFields,
  resolveInvite,
  submitIntegration,
} from '@/core/services/onboarding/IntegrationService'
import { recordEvent } from '@/core/services/system/ActivityService'

export const POST = createPublicRoute({
  status: 201,
  rateLimit: 'admission',
  descriptor: { summary: 'Answer an integration link', tags: ['integration'] },
  handler: async ({ params, raw }) => {
    const cookieStore = await cookies()
    const ticket = unpackTicket(cookieStore.get(INTEGRATION_TICKET_COOKIE)?.value)

    // The identity is the one the server itself resolved, never one the form sent
    if (!ticket || ticket.token !== params.token) throw notFound()

    const invite = await resolveInvite(params.token)
    const parsed = parseFormValues(await integrationFields(invite), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const outcome = await submitIntegration(params.token, ticket.claimId, parsed.values)

    // The ticket is spent, a reload never re-opens the same account
    cookieStore.delete(INTEGRATION_TICKET_COOKIE)

    if (outcome.accountId) {
      await recordEvent({
        eventType: 'MemberCreated',
        actorId: outcome.accountId,
        subjectId: outcome.accountId,
        targetType: 'member',
        targetId: outcome.accountId,
        summary: outcome.displayName,
      })
    }

    return outcome
  },
})
