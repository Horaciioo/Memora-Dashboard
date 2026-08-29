import { NextResponse, type NextRequest } from 'next/server'
import { isSessionTokenValid } from '@/core/lib/auth/getSession'
import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { ROUTES } from '@/declarations/navigation'

// Paths reachable
const PUBLIC_PATHS: string[] = [ROUTES.login]

// Path prefixes
const PUBLIC_PREFIXES: string[] = ['/admission']

/**
 * Route authentication redirect
 * @param {NextRequest} request - Incoming request
 * @return {Promise<NextResponse>} - Redirect or next
 */

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // Initialize session state
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const isSignInScreen = PUBLIC_PATHS.includes(pathname)

  // A prefix stays reachable either way
  const isOpenToEveryone =
    isSignInScreen || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(`${prefix}/`))

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

  // A dead token stops being resent even on open routes
  if (!hasSession && token) {
    const response = NextResponse.next()
    response.cookies.delete(SESSION_COOKIE)
    return response
  }

  // Continue routing
  return NextResponse.next()
}

// Proxy route matcher
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)',
  ],
}
