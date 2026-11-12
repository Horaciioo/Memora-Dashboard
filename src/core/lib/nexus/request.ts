import 'server-only'

import type { NextRequest } from 'next/server'

import { forbidden } from '@/core/lib/errors'
import { readPublicOrigin } from '@/core/lib/http/origin'
import { readAddress } from '@/core/lib/http/rateLimit'
import type { NexusCaller } from '@/core/services/nexus/NexusSessionService'

// Methods that never change anything
const SAFE_METHODS = ['GET', 'HEAD']

/**
 * Refuse a request that did not start on our own pages
 * @param {NextRequest} request - Incoming request
 * @return {void} - Throws when foreign
 */

export const assertSameOrigin = (request: NextRequest): void => {
  if (SAFE_METHODS.includes(request.method)) return

  const own = readPublicOrigin(request.headers, request.nextUrl.origin)
  const crossSite = request.headers.get('sec-fetch-site') === 'cross-site'

  if (crossSite || request.headers.get('origin') !== own) throw forbidden()
}

/**
 * Describe who is calling
 * @param {NextRequest} request - Incoming request
 * @return {NexusCaller} - Address and software
 */

export const readCaller = (request: NextRequest): NexusCaller => ({
  address: readAddress(request.headers) || 'unknown',
  userAgent: request.headers.get('user-agent')?.slice(0, 200) ?? null,
})
