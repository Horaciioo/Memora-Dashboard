import 'server-only'

import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

import { notAuthenticated, notFound } from '@/core/lib/errors'
import { assertSameOrigin, readCaller } from '@/core/lib/nexus/request'
import type { ProtectedRouteContext } from '@/core/lib/http/route'
import {
  findNexusSession,
  matchesCsrf,
  readHostSession,
} from '@/core/services/nexus/NexusSessionService'
import type { HostSession, NexusCaller } from '@/core/services/nexus/NexusSessionService'
import { NEXUS_COPY } from '@/declarations/nexus/copy'
import { NEXUS_PATHS } from '@/declarations/nexus/paths'
import { isNexusConfigured } from '@/declarations/nexus/owner'
import type { SessionUser } from '@/types/auth'
import { cookieName } from '@/utils/constants/cookies'
import type { NexusSession } from '@prisma/client'

/**
 * Console session proven for this request
 * @typedef {Object} NexusGuard
 * @property {NexusSession} nexus - Console session
 * @property {HostSession} host - Sign-in session
 * @property {NexusCaller} caller - Who is calling
 * @property {string} token - Cookie value
 */

export interface NexusGuard {
  nexus: NexusSession
  host: HostSession
  caller: NexusCaller
  token: string
}

/**
 * Owner and sign-in, the console never exists for anyone else
 * @param {SessionUser | null} session - Signed-in member
 * @param {NextRequest} request - Incoming request
 * @return {Promise<{ host: HostSession, caller: NexusCaller }>} - Host session
 */

export const requireOwner = async (
  session: SessionUser | null,
  request: NextRequest
): Promise<{ host: HostSession; caller: NexusCaller }> => {
  // Everyone but the owner gets a plain 404
  if (!session?.isRoot || !isNexusConfigured()) throw notFound()

  assertSameOrigin(request)

  const host = await readHostSession(session.id)
  if (!host) throw notFound()

  return { host, caller: readCaller(request) }
}

/**
 * Require an unlocked console session
 * @param {ProtectedRouteContext} context - Route context
 * @param {{ allowMovedAddress?: boolean }} [options] - Reauthentication route lets a moved address in
 * @return {Promise<NexusGuard>} - Proven session
 */

export const requireNexus = async (
  context: ProtectedRouteContext,
  options: { allowMovedAddress?: boolean } = {}
): Promise<NexusGuard> => {
  const { host, caller } = await requireOwner(context.session, context.request)

  const token = (await cookies()).get(cookieName('nexus'))?.value
  const lookup = await findNexusSession(token, host, caller, 'UNLOCKED')

  if (!token || !lookup.session) throw notAuthenticated(NEXUS_COPY.locked)
  if (lookup.state === 'reauth' && !options.allowMovedAddress) {
    throw notAuthenticated(NEXUS_COPY.reauthNeeded)
  }

  // Writes carry the anti-forgery header
  const safe = ['GET', 'HEAD'].includes(context.request.method)
  if (!safe && !matchesCsrf(token, context.request.headers.get(NEXUS_PATHS.csrfHeader))) {
    throw notAuthenticated(NEXUS_COPY.locked)
  }

  return { nexus: lookup.session, host, caller, token }
}
