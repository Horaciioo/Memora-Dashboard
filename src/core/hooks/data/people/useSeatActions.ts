'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import type { SeatAction, SeatFamily } from '@/declarations/members/seats'

/**
 * Gestures on the temporary seat of a member
 * @typedef {Object} SeatActions
 * @property {boolean} isSaving - Gesture in flight
 * @property {(input: { accountId: string, family: SeatFamily, sessionId: string, action: SeatAction }) => Promise<boolean>} act - Take back, give back or delete a seat
 */

export interface SeatActions {
  isSaving: boolean
  act: (input: {
    accountId: string
    family: SeatFamily
    sessionId: string
    action: SeatAction
  }) => Promise<boolean>
}

/**
 * Drive the participation gestures, the page reads again once one landed
 * @return {SeatActions} - State and gesture
 */

export const useSeatActions = (): SeatActions => {
  const router = useRouter()
  const { isSaving, run } = useMutation()

  const act = useCallback<SeatActions['act']>(
    async (input) => {
      const done = await run(() => apiPost(API_ROUTES.participations, input))
      if (done) router.refresh()

      return done !== null
    },
    [run, router]
  )

  return { isSaving, act }
}
