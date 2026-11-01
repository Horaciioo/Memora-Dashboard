'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { useIsFetching } from '@tanstack/react-query'

import { SPLASH_FLAGS, SPLASH_STORAGE_KEY, SPLASH_TIMING } from '@/declarations/ui/splash'

// SplashPhase
export type SplashPhase = 'intro' | 'exit' | 'done'

/**
 * Page loaded and quiet
 * @return {boolean} - True once settled
 */

const usePageSettled = (): boolean => {
  const isFetching = useIsFetching()
  const [isLoaded, setLoaded] = useState(false)
  const [isSettled, setSettled] = useState(false)

  // Document and fonts
  useEffect(() => {
    const markLoaded = () => void document.fonts.ready.then(() => setLoaded(true))

    if (document.readyState === 'complete') markLoaded()
    else window.addEventListener('load', markLoaded, { once: true })

    return () => window.removeEventListener('load', markLoaded)
  }, [])

  // Queries at rest
  useEffect(() => {
    if (!isLoaded || isFetching > 0) return

    const timer = window.setTimeout(() => setSettled(true), SPLASH_TIMING.settleMs)

    return () => window.clearTimeout(timer)
  }, [isLoaded, isFetching])

  return isSettled
}

// Armed flag, read on the client only
const subscribeNothing = () => () => undefined
const readArmed = () => document.documentElement.dataset.splash !== undefined

/**
 * Splash lifecycle
 * @return {{ phase: SplashPhase, skip: () => void }} - State and skip
 */

export const useSplash = () => {
  const isSettled = usePageSettled()
  const isArmed = useSyncExternalStore(subscribeNothing, readArmed, () => true)
  const [isHeld, setHeld] = useState(true)
  const [isForced, setForced] = useState(false)
  const [isReleased, setReleased] = useState(false)
  const isDue = !isHeld && (isSettled || isForced)

  // Phase follows the loading
  let phase: SplashPhase = 'intro'
  if (!isArmed || isReleased) phase = 'done'
  else if (isDue) phase = 'exit'

  // Minimum and maximum
  useEffect(() => {
    if (phase !== 'intro') return

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timers = [
      window.setTimeout(
        () => setHeld(false),
        isReduced ? SPLASH_TIMING.reducedMinMs : SPLASH_TIMING.minMs
      ),
      window.setTimeout(() => setForced(true), SPLASH_TIMING.maxMs),
    ]

    return () => timers.forEach(window.clearTimeout)
  }, [phase])

  // Open then release the page
  useEffect(() => {
    if (phase !== 'exit') return

    document.documentElement.dataset.splash = SPLASH_FLAGS.exit

    const timer = window.setTimeout(() => {
      delete document.documentElement.dataset.splash

      try {
        sessionStorage.setItem(SPLASH_STORAGE_KEY, '1')
      } catch {
        // Storage blocked
      }

      setReleased(true)
    }, SPLASH_TIMING.exitMs)

    return () => window.clearTimeout(timer)
  }, [phase])

  // Tap to leave
  const skip = useCallback(() => {
    setHeld(false)
    setForced(true)
  }, [])

  return { phase, skip }
}
