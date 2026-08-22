import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/core/lib/auth/session'

// Paths accessible without authentication
const PUBLIC_PATHS = ['/', '/login']

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
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect from login page
  if (hasSession && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/overview'
    return NextResponse.redirect(url)
  }

  // Continue routing
  return NextResponse.next()
}

// Middleware route matcher
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
