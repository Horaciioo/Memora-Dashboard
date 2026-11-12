import { cookies } from 'next/headers'

import { UNBAN_TICKET_COOKIE } from '@/core/lib/auth/unbanTicket'
import { createPublicRoute } from '@/core/lib/http/route'
import { unpackUnbanTicket } from '@/core/lib/unban/ticket'
import { submitRequest } from '@/core/services/unban/UnbanRequestService'
import type { SubmitOutcome } from '@/types/unban'

export const POST = createPublicRoute({
  rateLimit: 'unbanSubmit',
  descriptor: { summary: 'File a Deban. request on a link', tags: ['unban'] },
  handler: async ({ params, raw }): Promise<SubmitOutcome> => {
    const cookieStore = await cookies()
    const ticket = unpackUnbanTicket(cookieStore.get(UNBAN_TICKET_COOKIE)?.value)

    return submitRequest({ token: params.token, body: raw, ticket })
  },
})
