'use client'

import { useRouter } from 'next/navigation'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'

/**
 * Send one game move, the board read again after
 * @param {string} sessionId - Game
 * @return {Object} - act and pending flag
 */

export const usePlayAct = (sessionId: string) => {
  const router = useRouter()
  const { isSaving, run } = useMutation()

  return {
    isSaving,
    act: async (body: Record<string, unknown>, { quiet = false } = {}) => {
      const done = await run(() => apiPost(API_ROUTES.playAct(sessionId), body))
      if (done !== null && !quiet) router.refresh()

      return done !== null
    },
  }
}
