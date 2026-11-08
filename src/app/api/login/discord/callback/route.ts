import { cookies } from 'next/headers'

import {
  INTEGRATION_TICKET_COOKIE,
  packTicket,
  type IntegrationTicket,
  unpackTicket,
} from '@/core/lib/auth/integrationTicket'
import { EXERCISE_TICKET_COOKIE } from '@/core/lib/auth/exerciseTicket'
import { matchesToken, unpackHandshake } from '@/core/lib/auth/oauthState'
import { IDENTITY_CHECK_COOKIE, readWelcomeLink } from '@/core/lib/auth/identityTicket'
import { OAUTH_STATE_COOKIE } from '@/core/lib/auth/session'
import { notAuthenticated } from '@/core/lib/errors'
import { createRedirectRoute } from '@/core/lib/http/route'
import { exchangeCode, readDiscordUser, storeGrant } from '@/core/services/auth/DiscordService'
import { resolveDiscordAccount } from '@/core/services/auth/SessionService'
import { startSession } from '@/core/services/auth/sessionStart'
import { claimCheckLink } from '@/core/services/identity'
import { checkIdentity, holdCheck } from '@/core/services/identity/signIn'
import { exerciseFailure } from '@/core/services/recruitment/exerciseRedirects'
import { claimExerciseLink } from '@/core/services/recruitment/ExerciseLinkService'
import { claimIdentity } from '@/core/services/onboarding/IntegrationService'
import { SIGN_IN_ERRORS, signInFailure } from '@/declarations/access/signIn'
import { integrationFailure } from '@/core/services/onboarding/redirects'
import { AUTH_SETTINGS, EXERCISE_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { WELCOME_REFUSED_QUERY } from '@/declarations/onboarding/welcome'
import { isAccessClosed } from '@/core/lib/auth/closed'

/**
 * Exercise round trip still waiting for its identity
 * @param {string | undefined} packed - Cookie value
 * @return {IntegrationTicket | null} - Ticket without a claim
 */

const readOpenExercise = (packed: string | undefined): IntegrationTicket | null => {
  const ticket = unpackTicket(packed)

  return ticket && !ticket.claimId ? ticket : null
}

export const GET = createRedirectRoute({
  rateLimit: 'signIn',
  descriptor: { summary: 'Finish the Discord sign-in flow', tags: ['auth'] },
  onFailure: async (error, params) => {
    // A link's round trip owns its own failure screen
    const cookieStore = await cookies()
    const ticket = unpackTicket(cookieStore.get(INTEGRATION_TICKET_COOKIE)?.value)
    const exercise = readOpenExercise(cookieStore.get(EXERCISE_TICKET_COOKIE)?.value)

    if (exercise) return exerciseFailure(error, params)

    // A link a responsable handed out answers on its own screen
    const linkToken = readWelcomeLink(cookieStore.get(IDENTITY_CHECK_COOKIE)?.value)
    if (linkToken) return `${ROUTES.welcomeLink(linkToken)}?${WELCOME_REFUSED_QUERY}`

    return ticket ? integrationFailure(error, params) : signInFailure(error)
  },
  handler: async ({ query, request }) => {
    const cookieStore = await cookies()
    const handshake = unpackHandshake(cookieStore.get(OAUTH_STATE_COOKIE)?.value)
    const ticket = unpackTicket(cookieStore.get(INTEGRATION_TICKET_COOKIE)?.value)
    const exercise = readOpenExercise(cookieStore.get(EXERCISE_TICKET_COOKIE)?.value)

    // The handshake is single use whatever happens next
    cookieStore.delete(OAUTH_STATE_COOKIE)

    const code = query.get('code') ?? ''
    const state = query.get('state') ?? ''

    if (!handshake || code.length === 0) throw notAuthenticated(SIGN_IN_ERRORS.Expired)
    if (!matchesToken(handshake.state, state)) throw notAuthenticated(SIGN_IN_ERRORS.Expired)

    const grant = await exchangeCode(code, handshake.codeVerifier)
    const identity = await readDiscordUser(grant.accessToken)

    // An exercise link proves the candidate is who it was made for
    if (exercise) {
      const claimToken = await claimExerciseLink(exercise.token, identity)

      cookieStore.set(
        EXERCISE_TICKET_COOKIE,
        packTicket({ token: exercise.token, claimId: claimToken }),
        {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: ROUTES.home,
          maxAge: EXERCISE_SETTINGS.linkTtlMinutes * 60,
        }
      )

      return ROUTES.exercise(exercise.token)
    }

    // A link only ever needs the identity
    if (ticket) {
      const claimId = await claimIdentity(ticket.token, identity)

      cookieStore.set(INTEGRATION_TICKET_COOKIE, packTicket({ token: ticket.token, claimId }), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: ROUTES.home,
        maxAge: AUTH_SETTINGS.stateTtlSeconds,
      })

      return ROUTES.integration(ticket.token)
    }

    // A link a responsable handed out only accepts the identifier it was made for
    const welcomeLink = readWelcomeLink(cookieStore.get(IDENTITY_CHECK_COOKIE)?.value)
    const linkCheck = welcomeLink ? await claimCheckLink(welcomeLink, identity) : null
    if (linkCheck) return holdCheck(linkCheck)

    // Discord proves who they are
    const account = await resolveDiscordAccount(identity)
    if (account && isAccessClosed(account)) throw notAuthenticated(SIGN_IN_ERRORS.Revoked)

    // Nothing opens before the person confirms who they are
    const checkId = await checkIdentity(identity, account)
    if (checkId) return holdCheck(checkId)

    if (!account) throw notAuthenticated(SIGN_IN_ERRORS.Unknown)

    await startSession(account.id, request)
    await storeGrant(account.id, grant)

    return handshake.returnTo ?? ROUTES.dashboard
  },
})
