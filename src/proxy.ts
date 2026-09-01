import crypto from 'crypto'

import { NextResponse, type NextRequest } from 'next/server'
import { isSessionTokenValid } from '@/core/lib/auth/getSession'
import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { buildContentSecurityPolicy } from '@/declarations/system/contentSecurityPolicy'
import { NONCE_HEADER } from '@/declarations/system/securityHeaders'
import { ROUTES } from '@/declarations/navigation'

// Paths reachable
const PUBLIC_PATHS: string[] = [ROUTES.login, ROUTES.privacy]

// Path prefixes
const PUBLIC_PREFIXES: string[] = ['/integration']

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
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(`${prefix}/`))

  // A stale token fails closed rather than crashing the proxy
  const hasSession = token ? await isSessionTokenValid(token).catch(() => false) : false

  // Redirect unauthenticated users
  if (!hasSession && !isOpenToEveryone) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.login
    const response = NextResponse.redirect(url)
    if (token) response.cookies.delete(SESSION_COOKIE)
    return response
  }

  // Redirect away from the sign-in screen
  if (hasSession && isSignInScreen) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.dashboard
    return NextResponse.redirect(url)
  }

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
