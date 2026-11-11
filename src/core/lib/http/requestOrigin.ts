import 'server-only'

import { AsyncLocalStorage } from 'node:async_hooks'

import type { NextRequest } from 'next/server'

import { routeKey } from '@/core/lib/nexus/observe/metrics'
import { OBSERVABILITY } from '@/core/lib/nexus/observe/registry'
import { TAB_HEADER } from '@/core/lib/api/tab'
import { readAddress } from '@/core/lib/http/rateLimit'
import { runInRequestZone } from '@/core/lib/http/requestZone'

/**
 * Where a request came from
 * @typedef {Object} RequestOrigin
 * @property {string | null} route - Method and path
 * @property {string | null} ip - Client address
 * @property {string | null} userAgent - Client software
 * @property {string | null} tab - Browser tab that wrote
 * @property {string | null} requestId - Identifier of the request
 */

export interface RequestOrigin {
  route: string | null
  ip: string | null
  userAgent: string | null
  tab: string | null
  requestId: string | null
}

// Header carrying the identifier
const REQUEST_ID_HEADER = 'x-request-id'

// Longest header value kept
const ORIGIN_MAX_LENGTH = 200

const storage = new AsyncLocalStorage<RequestOrigin>()

// Header values stay short
const clip = (value: string | null): string | null =>
  value ? value.slice(0, ORIGIN_MAX_LENGTH) : null

// Identifier shapes worth keeping
const REQUEST_ID = /^[A-Za-z0-9-]{8,64}$/

/**
 * Identifier of a request, the proxy's own only when it is trusted
 * @param {Headers} headers - Request headers
 * @return {string} - Identifier
 */

const requestIdOf = (headers: Headers): string => {
  const incoming = headers.get(REQUEST_ID_HEADER)

  return process.env.TRUSTED_REQUEST_ID === 'true' && incoming && REQUEST_ID.test(incoming)
    ? incoming
    : crypto.randomUUID()
}

/**
 * Run a handler inside its request origin
 * @param {NextRequest} request - Incoming request
 * @param {() => Promise<T>} run - Handler
 * @return {Promise<T>} - Handler result
 */

export const runWithOrigin = <T>(request: NextRequest, run: () => Promise<T>): Promise<T> => {
  const requestId = requestIdOf(request.headers)
  const startedAt = performance.now()
  const route = `${request.method} ${routeKey(request.nextUrl.pathname)}`

  return storage.run(
    {
      route: `${request.method} ${request.nextUrl.pathname}`,
      ip: clip(readAddress(request.headers)),
      userAgent: clip(request.headers.get('user-agent')),
      tab: clip(request.headers.get(TAB_HEADER)),
      requestId,
    },
    () =>
      runInRequestZone(run).then((result) => {
        // Handed back so a report can quote it
        if (result instanceof Response) result.headers.set(REQUEST_ID_HEADER, requestId)

        // Counted by route, never by row
        const status = result instanceof Response ? result.status : 200
        OBSERVABILITY.http.add(route, performance.now() - startedAt, status >= 500)

        return result
      })
  )
}

/**
 * Run work under its own request identifier, sockets and jobs
 * @param {string} route - What runs
 * @param {() => Promise<T>} run - Work
 * @param {string} [requestId] - Identifier carried from elsewhere
 * @return {Promise<T>} - Work result
 */

export const runWithRequestId = <T>(
  route: string,
  run: () => Promise<T>,
  requestId: string = crypto.randomUUID()
): Promise<T> => storage.run({ route, ip: null, userAgent: null, tab: null, requestId }, run)

/**
 * Identifier of the running request
 * @return {string | null} - Identifier, none outside a request
 */

export const readRequestId = (): string | null => storage.getStore()?.requestId ?? null

/**
 * Read the origin of the current request
 * @return {Promise<RequestOrigin>} - Origin, empty outside a request
 */

export const readOrigin = async (): Promise<RequestOrigin> => {
  const stored = storage.getStore()
  if (stored) return stored

  // Server actions and pages carry headers only
  try {
    // Loaded late, scripts run without Next
    const { headers } = await import('next/headers')
    const store = await headers()

    return {
      route: null,
      ip: clip(readAddress(store)),
      userAgent: clip(store.get('user-agent')),
      tab: clip(store.get(TAB_HEADER)),
      requestId: null,
    }
  } catch {
    return { route: null, ip: null, userAgent: null, tab: null, requestId: null }
  }
}
