'use client'

import { useEffect } from 'react'

import { checkRecap, markPresent } from '@/core/lib/recap/client'
import { useRecapStore } from '@/core/store/recap'
import { RECAP_SETTINGS } from '@/declarations/configurations/settings'

/**
 * Welcome the member back on arrival and on return to the tab
 * @return {void}
 */

export const useRecapPresence = (): void => {
  useEffect(() => {
    const isHere = () => document.visibilityState === 'visible'
    const settle = (isArrival = false) => void checkRecap(isArrival).catch(() => undefined)

    // A recap still on screen holds the clock back
    const beat = () => {
      if (isHere() && !useRecapStore.getState().isOpen) void markPresent().catch(() => undefined)
    }
    const onVisible = () => {
      if (isHere() && !useRecapStore.getState().isOpen) settle()
    }

    settle(true)
    const timer = window.setInterval(beat, RECAP_SETTINGS.heartbeatMs)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
}
