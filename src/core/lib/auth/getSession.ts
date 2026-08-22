import { cookies } from 'next/headers'
import { SESSION_COOKIE, type AuthSession } from '@/core/lib/auth/session'

/**
 * Get session
 * @return {Promise<AuthSession | null>} - Session
 */

export const getSession = async (): Promise<AuthSession | null> => {
  const cookieStore = await cookies()
  const email = cookieStore.get(SESSION_COOKIE)?.value
  return email ? { email } : null
}
