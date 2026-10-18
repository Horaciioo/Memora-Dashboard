import { cookies } from 'next/headers'

import { getSession } from '@/core/lib/auth/getSession'
import {
  createHandshake,
  matchesToken,
  packHandshake,
  unpackHandshake,
} from '@/core/lib/auth/oauthState'
import { PLATFORM_STATE_COOKIE } from '@/core/lib/auth/session'
import { notAuthenticated } from '@/core/lib/errors'
import { createRedirectRoute } from '@/core/lib/http/route'
import type { RouteHandler } from '@/core/lib/http/route'
import { PLATFORM_LINKERS } from '@/core/lib/platforms/linkers'
import { storePlatformGrant } from '@/core/services/platforms/PlatformAccountService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { AUTH_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { LINK_RESULT, linkDestination } from '@/declarations/platforms/link'
import { platformLogoOf } from '@/declarations/platforms/logos'
import type { LivePlatformName } from '@/utils/constants/lives'

/**
 * Route sending a member to a platform to grant access
 * @param {LivePlatformName} platform - Platform to link
 * @return {RouteHandler} - Route handler
 */

export const createLinkStartRoute = (platform: LivePlatformName): RouteHandler =>
  createRedirectRoute({
    rateLimit: 'signIn',
    descriptor: { summary: `Start linking a ${platform} account`, tags: ['platforms'] },
    onFailure: () => linkDestination(platform, LINK_RESULT.failed),
    handler: async () => {
      // Only a signed-in member links an account
      const session = await getSession()
      if (!session) throw notAuthenticated()

      const handshake = createHandshake()
      const cookieStore = await cookies()
      cookieStore.set(PLATFORM_STATE_COOKIE, packHandshake(handshake), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: ROUTES.home,
        maxAge: AUTH_SETTINGS.stateTtlSeconds,
      })

      return PLATFORM_LINKERS[platform].authorizeUrl(handshake.state)
    },
  })

/**
 * Route finishing the link once the platform answered
 * @param {LivePlatformName} platform - Platform being linked
 * @return {RouteHandler} - Route handler
 */

export const createLinkReturnRoute = (platform: LivePlatformName): RouteHandler =>
  createRedirectRoute({
    rateLimit: 'signIn',
    descriptor: { summary: `Finish linking a ${platform} account`, tags: ['platforms'] },
    onFailure: () => linkDestination(platform, LINK_RESULT.failed),
    handler: async ({ query }) => {
      const session = await getSession()
      const cookieStore = await cookies()
      const handshake = unpackHandshake(cookieStore.get(PLATFORM_STATE_COOKIE)?.value)

      // The handshake is single use whatever happens next
      cookieStore.delete(PLATFORM_STATE_COOKIE)

      const code = query.get('code') ?? ''
      if (!session || !handshake || code.length === 0) throw notAuthenticated()
      if (!matchesToken(handshake.state, query.get('state') ?? '')) throw notAuthenticated()

      const linker = PLATFORM_LINKERS[platform]
      const grant = await linker.exchange(code)
      const identity = await linker.identify(grant.accessToken)
      await storePlatformGrant(session.id, platform, grant, identity)

      await recordEvent({
        eventType: 'PlatformLinked',
        actorId: session.id,
        summary: `${platformLogoOf(platform)?.label ?? platform} · ${identity.login}`,
      })

      return linkDestination(platform, LINK_RESULT.linked)
    },
  })
