import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { ROUTES } from '@/declarations/navigation'

// Paths reachable
const PUBLIC_PATHS: string[] = [ROUTES.login]

// Path prefixes
const PUBLIC_PREFIXES: string[] = ['/admission']

/**
 * Route authentication redirect
 * @param {NextRequest} request - Incoming request
 * @return {NextResponse} - Redirect or next
 */

export function proxy(request: NextRequest) {
  // Initialize session state
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has(SESSION_COOKIE)
  const isSignInScreen = PUBLIC_PATHS.includes(pathname)

  // A prefix stays reachable either way
  const isOpenToEveryone =
    isSignInScreen || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(`${prefix}/`))

  // Redirect unauthenticated users
  if (!hasSession && !isOpenToEveryone) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.login
    return NextResponse.redirect(url)
  }

  // Redirect away from the sign-in screen
  if (hasSession && isSignInScreen) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.dashboard
    return NextResponse.redirect(url)
  }

  // Continue routing
  return NextResponse.next()
}

// Proxy route matcher
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
