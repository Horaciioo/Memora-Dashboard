import { redirect } from 'next/navigation'
import { getSession } from '@/core/lib/auth/getSession'
import type { AuthSession } from '@/core/lib/auth/session'

/**
 * Require user
 * @return {Promise<AuthSession>} - Session
 */

export const requireUser = async (): Promise<AuthSession> => {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

/**
 * Optional user
 * @return {Promise<AuthSession | null>} - Session
 */

export const optionalUser = async (): Promise<AuthSession | null> => getSession()
