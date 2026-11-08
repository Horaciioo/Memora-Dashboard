import { cookies } from 'next/headers'

import { unpackTicket } from '@/core/lib/auth/integrationTicket'
import { EXERCISE_TICKET_COOKIE } from '@/core/lib/auth/exerciseTicket'
import { forbidden } from '@/core/lib/errors'
import { createPublicRoute } from '@/core/lib/http/route'
import { recordPlay } from '@/core/services/recruitment/ExerciseLinkService'
import { EXERCISE_SETTINGS } from '@/declarations/configurations/settings'

export const POST = createPublicRoute({
  rateLimit: 'admission',
  descriptor: { summary: 'Count one playing of a written context', tags: ['recruitment'] },
  handler: async ({ params }) => {
    const cookieStore = await cookies()
    const ticket = unpackTicket(cookieStore.get(EXERCISE_TICKET_COOKIE)?.value)

    // Only the browser that proved the identity plays
    if (!ticket || ticket.token !== params.token || !ticket.claimId) throw forbidden()

    const plays = await recordPlay(params.token, ticket.claimId)

    return { plays, left: EXERCISE_SETTINGS.maxPlays - plays }
  },
})
