'use client'

import { createContext, useContext, useMemo } from 'react'

import { useAuth } from '@/core/hooks/auth/useAuth'
import { useSessionUser } from '@/core/hooks/auth/useSessionUser'
import { resolvePermissions } from '@/core/services/auth/PermissionsService'
import type { PermissionHelpers, SessionUser } from '@/types/auth'

/**
 * Auth context
 * @typedef {Object} AuthContextValue
 * @property {SessionUser | null} session - Authenticated user or null
 * @property {boolean} isLoading - Session loading state
 * @property {boolean} isAuthenticated - User logged in
 * @property {boolean} mustChangePassword - Password change required
 * @property {(permission: Permission) => boolean} can - Check single permission
 * @property {(permissions: Permission[]) => boolean} canAny - Check any permission
 * @property {(permissions: Permission[]) => boolean} canAll - Check all permissions
 * @property {boolean} isAdmin - User is administrator
 * @property {boolean} isReadOnly - User in read-only mode
 * @property {ReturnType<typeof useAuth>} auth - Sign in, sign out, password mutations
 */

interface AuthContextValue extends PermissionHelpers {
  session: SessionUser | null
  isLoading: boolean
  isAuthenticated: boolean
  mustChangePassword: boolean
  auth: ReturnType<typeof useAuth>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Auth provider props
 * @typedef {Object} AuthProviderProps
 * @property {React.ReactNode} children - Provider children
 * @property {SessionUser | null} [initialSession] - Server-resolved session
 */

interface AuthProviderProps {
  children: React.ReactNode
  initialSession?: SessionUser | null
}

/**
 * Auth provider
 * @param {AuthProviderProps} props - Provider configuration
 * @param {React.ReactNode} props.children - Tree children
 * @param {SessionUser | null} [props.initialSession] - Initial session data
 * @return {JSX.Element} - Context provider
 */

export const AuthProvider = ({ children, initialSession }: AuthProviderProps) => {
  const { data, isLoading } = useSessionUser(initialSession)
  const session = data ?? null
  const permissions = useMemo(() => resolvePermissions(session), [session])
  const auth = useAuth()

  const value = useMemo<AuthContextValue>(
    () => ({
      ...permissions,
      session,
      isLoading,
      isAuthenticated: session !== null,
      mustChangePassword: session?.mustChangePassword ?? false,
      auth,
    }),
    [permissions, session, isLoading, auth]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Use auth context
 * @return {AuthContextValue} - Auth state and mutations
 */

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used within AuthProvider')

  return context
}
