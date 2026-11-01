import crypto from 'crypto'

import { NextResponse, type NextRequest } from 'next/server'
import { isSessionTokenValid } from '@/core/lib/auth/getSession'
import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { readPublicOrigin } from '@/core/lib/http/origin'
import { buildContentSecurityPolicy } from '@/declarations/system/security/contentSecurityPolicy'
import { NONCE_HEADER } from '@/declarations/system/security/securityHeaders'
import { DEMO_EVENT_ID, EVENT_ID_PATTERN } from '@/core/lib/share/sharedEvent'
import { ROUTES } from '@/declarations/navigation'
import { MANIFEST_PATH } from '@/declarations/pwa/manifest'
import { WORKER_FILE } from '@/declarations/pwa/worker'

// Paths reachable, the worker and its fallback page included so they update signed out
const PUBLIC_PATHS: string[] = [
  ROUTES.login,
  ROUTES.privacy,
  ROUTES.offline,
  ROUTES.status,
  WORKER_FILE.script,
  MANIFEST_PATH,
]

// Short address of an event and its card picture, read by robots that never sign in
const SHARE_PATH = new RegExp(
  `^/(opengraph-image.*|(${DEMO_EVENT_ID}|${EVENT_ID_PATTERN.source.slice(1, -1)})(/opengraph-image.*)?)$`
)

// Path prefixes
const PUBLIC_PREFIXES: string[] = ['/integration', '/exercice']

/**
 * Build the per-request nonce and the policy carrying it
 * @return {{ nonce: string, policy: string }} - Request nonce and policy
 */

const buildPolicy = (): { nonce: string; policy: string } => {
  const nonce = crypto.randomBytes(16).toString('base64')

  return {
    nonce,
    policy: buildContentSecurityPolicy(nonce, process.env.NODE_ENV !== 'production'),
  }
}

/**
 * Continue routing with the policy attached to both request and response
 * @param {NextRequest} request - Incoming request
 * @return {NextResponse} - Response carrying the policy
 */

const withPolicy = (request: NextRequest): NextResponse => {
  const { nonce, policy } = buildPolicy()

  // The document reads the nonce back off its own request headers
  const headers = new Headers(request.headers)
  headers.set(NONCE_HEADER, nonce)
  headers.set('content-security-policy', policy)

  const response = NextResponse.next({ request: { headers } })
  response.headers.set('content-security-policy', policy)

  return response
}

/**
 * Route authentication redirect
 * @param {NextRequest} request - Incoming request
 * @return {Promise<NextResponse>} - Redirect or next
 */

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // Initialize session state
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const isSignInScreen = pathname === ROUTES.login

  // A prefix stays reachable either way
  const isOpenToEveryone =
    PUBLIC_PATHS.includes(pathname) ||
    SHARE_PATH.test(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(`${prefix}/`))

  // A stale token fails closed rather than crashing the proxy
  const hasSession = token ? await isSessionTokenValid(token).catch(() => false) : false

  // Origin members used
  const origin = readPublicOrigin(request.headers, request.nextUrl.origin)

  // Redirect unauthenticated users
  if (!hasSession && !isOpenToEveryone) {
    const response = NextResponse.redirect(new URL(ROUTES.login, origin))
    if (token) response.cookies.delete(SESSION_COOKIE)
    return response
  }

  // Redirect away from the sign-in screen
  if (hasSession && isSignInScreen) return NextResponse.redirect(new URL(ROUTES.dashboard, origin))

  const response = withPolicy(request)

  // A dead token stops being resent even on open routes
  if (!hasSession && token) response.cookies.delete(SESSION_COOKIE)

  return response
}

// Proxy route matcher
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)',
  ],
}
