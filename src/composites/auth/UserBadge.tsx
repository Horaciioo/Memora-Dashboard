'use client'

import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

/**
 * Signed-in user's email, from the auth context
 * @return {JSX.Element | null}
 */

export const UserBadge = () => {
  const { session } = useAuthContext()
  if (!session) return null

  return <span className="text-sm text-[var(--color-ink-subtle)]">{session.email}</span>
}
