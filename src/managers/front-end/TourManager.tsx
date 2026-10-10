'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { useMutation } from '@/core/hooks/data/useMutation'
import { useIsMobileShell } from '@/core/hooks/interaction/useBreakpoint'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { nextRoute, unlockedRoutes } from '@/core/lib/tour/progress'
import { GUIDE_KEYS, tourPageKey } from '@/declarations/academy/welcome'
import type { GuideKey } from '@/declarations/academy/welcome'
import type { TourScene } from '@/declarations/tour/pages'
import type { TourState } from '@/types/tour'

/**
 * First visit state and the gestures that move it
 * @typedef {Object} TourContextValue
 * @property {boolean} isIntroOpen - Admission and presentation still to play
 * @property {boolean} isTouring - Pages are being unlocked one by one
 * @property {string | null} next - Page waiting to be explained
 * @property {number} remaining - Pages still to explain
 * @property {(route: string) => boolean} isUnlocked - Page the rail may show
 * @property {() => void} finishIntro - Admission and presentation done
 * @property {(route: string) => void} finishPage - Page explained
 * @property {() => void} skip - Leave the visit
 * @property {boolean} isCelebrating - The last page is explained, the visit is saluted
 * @property {() => void} finishTour - Last page explained: remembered and saluted
 * @property {() => void} endCelebration - Salute closed
 * @property {TourScene | null} scene - What the page plays by itself right now
 * @property {(scene: TourScene | null) => void} playScene - Start or stop it
 */

interface TourContextValue {
  isIntroOpen: boolean
  isTouring: boolean
  next: string | null
  remaining: number
  isUnlocked: (route: string) => boolean
  finishIntro: () => void
  finishPage: (route: string) => void
  skip: () => void
  isCelebrating: boolean
  finishTour: () => void
  endCelebration: () => void
  scene: TourScene | null
  playScene: (scene: TourScene | null) => void
}

const INACTIVE: TourContextValue = {
  isIntroOpen: false,
  isTouring: false,
  next: null,
  remaining: 0,
  isUnlocked: () => true,
  finishIntro: () => undefined,
  finishPage: () => undefined,
  skip: () => undefined,
  isCelebrating: false,
  finishTour: () => undefined,
  endCelebration: () => undefined,
  scene: null,
  playScene: () => undefined,
}

const TourContext = createContext<TourContextValue>(INACTIVE)

/**
 * First visit provider
 * @param {Object} props - Provider props
 * @param {TourState | null} props.initial - State resolved server-side
 * @param {ReactNode} props.children - Tree children
 * @return {JSX.Element}
 */

export const TourProvider = ({
  initial,
  children,
}: {
  initial: TourState | null
  children: ReactNode
}) => {
  const [state, setState] = useState(initial)
  const [scene, playScene] = useState<TourScene | null>(null)
  const [isCelebrating, setCelebrating] = useState(false)
  const { run } = useMutation()
  const isMobile = useIsMobileShell()

  // Kept on the account, so the visit resumes where it stopped
  const remember = useCallback(
    (key: GuideKey) => void run(() => apiPost(API_ROUTES.seenGuide, { key })),
    [run]
  )

  const finishIntro = useCallback(() => {
    setState((current) => current && { ...current, isIntroSeen: true })
    remember(GUIDE_KEYS.tourIntro)
  }, [remember])

  const finishPage = useCallback(
    (route: string) => {
      setState((current) =>
        current && !current.seen.includes(route)
          ? { ...current, seen: [...current.seen, route] }
          : current
      )
      remember(tourPageKey(route))
    },
    [remember]
  )

  const skip = useCallback(() => {
    setState(null)
    remember(GUIDE_KEYS.tourSkipped)
  }, [remember])

  const finishTour = useCallback(() => {
    setCelebrating(true)
    remember(GUIDE_KEYS.tourDone)
  }, [remember])

  const endCelebration = useCallback(() => setCelebrating(false), [])

  const value = useMemo<TourContextValue>(() => {
    if (!state) return { ...INACTIVE, isCelebrating, endCelebration }

    const next = nextRoute(state.routes, state.seen)
    // The pages walk is for the desktop rail
    const isTouring = state.isIntroSeen && next !== null && !isMobile
    const unlocked = unlockedRoutes(state.routes, state.seen)

    return {
      isIntroOpen: !state.isIntroSeen,
      isTouring,
      next,
      remaining: state.routes.length - state.seen.length,
      isUnlocked: (route) => !isTouring || unlocked.includes(route),
      finishIntro,
      finishPage,
      skip,
      isCelebrating,
      finishTour,
      endCelebration,
      scene,
      playScene,
    }
  }, [
    state,
    isMobile,
    finishIntro,
    finishPage,
    skip,
    isCelebrating,
    finishTour,
    endCelebration,
    scene,
  ])

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

/**
 * Read the first visit
 * @return {TourContextValue} - Visit state and gestures
 */

export const useTour = (): TourContextValue => useContext(TourContext)
