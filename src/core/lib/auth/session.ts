import type { SessionUser } from '@/types/auth'
import { Permissions } from '@/utils/constants/permissions'

export const SESSION_COOKIE = 'template_session'

export interface AuthSession {
  email: string
}

/**
 * Map to session user
 * @param {AuthSession} session - Session
 * @return {SessionUser} - User
 */

export const toSessionUser = (session: AuthSession): SessionUser => ({
  id: session.email,
  email: session.email,
  role: 'admin',
  permissions: Object.values(Permissions),
  mustChangePassword: false,
})

/**
 * Check demo credentials
 * @param {string} email - Email
 * @param {string} password - Password
 * @return {boolean} - Valid
 */

export const isValidDemoCredentials = (email: string, password: string) =>
  email === 'demo@example.com' && password === 'password'
