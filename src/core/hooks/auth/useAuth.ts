'use client'

import { useCallback, useTransition } from 'react'

import { logout } from '@/app/connexion/actions'
import { wipeOfflinePages } from '@/core/lib/pages/offline/store'

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
    startTransition(async () => {
      // Private pages never outlive the session
      await wipeOfflinePages()
      await logout()
    })
  }, [])

  return { isPending, signOut }
}
