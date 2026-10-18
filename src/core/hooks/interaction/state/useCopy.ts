'use client'

import { useCallback } from 'react'

import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'

/**
 * Copy a text and say so
 * @param {string} confirmation - Toast shown once copied
 * @return {(text: string) => Promise<void>} - Copier
 */

export const useCopy = (confirmation: string): ((text: string) => Promise<void>) => {
  const { notify } = useNotifications()

  return useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text)
      notify({ tone: 'success', title: confirmation })
    },
    [confirmation, notify]
  )
}
