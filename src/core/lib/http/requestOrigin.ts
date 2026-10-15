import 'server-only'

import { AsyncLocalStorage } from 'node:async_hooks'

import type { NextRequest } from 'next/server'

import { readAddress } from '@/core/lib/http/rateLimit'

/**
 * Where a request came from
 * @typedef {Object} RequestOrigin
 * @property {string | null} route - Method and path
 * @property {string | null} ip - Client address
 * @property {string | null} userAgent - Client software
 */

export interface RequestOrigin {
  route: string | null
  ip: string | null
  userAgent: string | null
}

// Longest header value kept
const ORIGIN_MAX_LENGTH = 200

const storage = new AsyncLocalStorage<RequestOrigin>()

// Header values stay short
const clip = (value: string | null): string | null =>
  value ? value.slice(0, ORIGIN_MAX_LENGTH) : null

/**
 * Run a handler inside its request origin
 * @param {NextRequest} request - Incoming request
 * @param {() => Promise<T>} run - Handler
 * @return {Promise<T>} - Handler result
 */

export const runWithOrigin = <T>(request: NextRequest, run: () => Promise<T>): Promise<T> =>
  storage.run(
    {
      route: `${request.method} ${request.nextUrl.pathname}`,
      ip: clip(readAddress(request.headers)),
      userAgent: clip(request.headers.get('user-agent')),
    },
    run
  )

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
    }
  } catch {
    return { route: null, ip: null, userAgent: null }
  }
}
