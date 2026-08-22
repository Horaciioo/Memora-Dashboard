'use client'

import { useCallback, useTransition } from 'react'

import { logout } from '@/app/connexion/actions'

/**
 * Auth actions
 * @typedef {Object} AuthActions
 * @property {boolean} isPending - Pending
 * @property {() => void} signOut - Sign out
 */

export interface AuthActions {
  isPending: boolean
  signOut: () => void
}

/**
 * Use auth
 * @return {AuthActions} - Actions
 */

export const useAuth = (): AuthActions => {
  const [isPending, startTransition] = useTransition()

  const signOut = useCallback(() => {
    startTransition(() => {
      void logout()
    })
  }, [])

  return { isPending, signOut }
}
