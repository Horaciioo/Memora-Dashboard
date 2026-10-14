import { cookies } from 'next/headers'

import { packTicket } from '@/core/lib/auth/integrationTicket'
import { EXERCISE_TICKET_COOKIE } from '@/core/lib/auth/exerciseTicket'
import { createHandshake, packHandshake } from '@/core/lib/auth/oauthState'
import { OAUTH_STATE_COOKIE } from '@/core/lib/auth/session'
import { createRedirectRoute } from '@/core/lib/http/route'
import { buildAuthorizationUrl } from '@/core/services/auth/DiscordService'
import { devIdentity, SKIPS_DISCORD } from '@/core/services/auth/devIdentity'
import { exerciseFailure } from '@/core/services/recruitment/exerciseRedirects'
import {
  claimExerciseLink,
  resolveExerciseLink,
} from '@/core/services/recruitment/ExerciseLinkService'
import { AUTH_SETTINGS, EXERCISE_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'

export const GET = createRedirectRoute({
  rateLimit: 'signIn',
  descriptor: { summary: 'Start the Discord identity check of an exercise', tags: ['recruitment'] },
  onFailure: exerciseFailure,
  handler: async ({ params }) => {
    const { token } = params

    // A dead link never reaches Discord
    const link = await resolveExerciseLink(token)

    const handshake = createHandshake()
    const cookieStore = await cookies()

    const shared = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: ROUTES.home,
      maxAge: AUTH_SETTINGS.stateTtlSeconds,
    }

    // Tests skip Discord and play as the candidate the link was made for
    if (SKIPS_DISCORD) {
      const claimToken = await claimExerciseLink(token, devIdentity(link.discordId))
      cookieStore.set(EXERCISE_TICKET_COOKIE, packTicket({ token, claimId: claimToken }), {
        ...shared,
        maxAge: EXERCISE_SETTINGS.linkTtlMinutes * 60,
      })

      return ROUTES.exercise(token)
    }

    cookieStore.set(OAUTH_STATE_COOKIE, packHandshake(handshake), shared)

    // The ticket tells the shared callback whose round trip this is
    cookieStore.set(EXERCISE_TICKET_COOKIE, packTicket({ token }), shared)

    return buildAuthorizationUrl(handshake.state, handshake.codeVerifier)
  },
})
