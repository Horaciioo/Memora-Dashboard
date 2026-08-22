import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { ROUTES } from '@/declarations/navigation'

// Paths reachable without a session
const PUBLIC_PATHS: string[] = [ROUTES.login]

/**
 * Route authentication redirect
 * @param {NextRequest} request - Incoming request
 * @return {NextResponse} - Redirect or next
 */

export function proxy(request: NextRequest) {
  // Initialize session state
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has(SESSION_COOKIE)
  const isPublicPath = PUBLIC_PATHS.includes(pathname)

  // Redirect unauthenticated users
  if (!hasSession && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.login
    return NextResponse.redirect(url)
  }

  // Redirect away from the sign-in screen
  if (hasSession && isPublicPath) {
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
