import { cookies } from 'next/headers'

import { UNBAN_TICKET_COOKIE } from '@/core/lib/auth/unbanTicket'
import { createPublicRoute } from '@/core/lib/http/route'
import { identityFor, unpackUnbanTicket } from '@/core/lib/unban/ticket'
import { readFollowUp } from '@/core/services/unban/UnbanRequestService'
import type { PublicRequestView } from '@/types/unban'

export const GET = createPublicRoute({
  rateLimit: 'unbanPublic',
  descriptor: { summary: 'Read the follow-up of a Deban. request', tags: ['unban'] },
  handler: async ({ params }): Promise<PublicRequestView> => {
    const cookieStore = await cookies()
    const ticket = unpackUnbanTicket(cookieStore.get(UNBAN_TICKET_COOKIE)?.value)

    return readFollowUp(params.creator, identityFor(ticket, params.creator))
  },
})
