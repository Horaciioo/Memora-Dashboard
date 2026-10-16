'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { PARKOUR_COPY } from '@/declarations/academy/parkour'

/**
 * Gestures a responsable makes on a whole promotion
 * @typedef {Object} PromotionActions
 * @property {boolean} isSaving - Gesture in flight
 * @property {() => Promise<boolean>} launch - Launch the promotion without waiting
 * @property {() => Promise<boolean>} openSecondPeriod - Open the second period for everyone
 */

export interface PromotionActions {
  isSaving: boolean
  launch: () => Promise<boolean>
  openSecondPeriod: () => Promise<boolean>
}

/**
 * Gestures a responsable makes on the journey of one junior
 * @typedef {Object} JuniorActions
 * @property {boolean} isSaving - Gesture in flight
 * @property {() => Promise<boolean>} declareKickoff - Open the integration of the junior
 * @property {() => Promise<boolean>} resign - Record their resignation
 */

export interface JuniorActions {
  isSaving: boolean
  declareKickoff: () => Promise<boolean>
  resign: () => Promise<boolean>
}

/**
 * Post one gesture, then reread the page
 * @return {{ isSaving: boolean, act: (path: string, body: object, success: string) => Promise<boolean> }} - Runner
 */

const useGesture = () => {
  const router = useRouter()
  const { isSaving, run } = useMutation()

  const act = useCallback(
    async (path: string, body: object, success: string) => {
      const done = await run(() => apiPost(path, body), success)
      if (done !== null) router.refresh()

      return done !== null
    },
    [run, router]
  )

  return { isSaving, act }
}

/**
 * Drive the gestures a responsable makes on a promotion
 * @param {string} sessionId - Promotion identifier
 * @return {PromotionActions} - Gestures
 */

export const usePromotionActions = (sessionId: string): PromotionActions => {
  const { isSaving, act } = useGesture()

  return {
    isSaving,
    launch: () => act(API_ROUTES.sessionLaunch(sessionId), {}, PARKOUR_COPY.launched),
    openSecondPeriod: () =>
      act(API_ROUTES.sessionSecondPeriod(sessionId), {}, PARKOUR_COPY.secondPeriodOpened),
  }
}

/**
 * Drive the gestures a responsable makes on the journey of one junior
 * @param {string} juniorId - Junior identifier
 * @return {JuniorActions} - Gestures
 */

export const useJuniorActions = (juniorId: string): JuniorActions => {
  const { isSaving, act } = useGesture()

  return {
    isSaving,
    declareKickoff: () =>
      act(API_ROUTES.juniorParkour(juniorId), { action: 'kickoff' }, PARKOUR_COPY.kickoffDeclared),
    resign: () =>
      act(API_ROUTES.juniorParkour(juniorId), { action: 'resign' }, PARKOUR_COPY.resigned),
  }
}
