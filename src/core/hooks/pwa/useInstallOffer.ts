'use client'

import { useEffect } from 'react'

import { useInstallHintStore, usePwaStore } from '@/core/store/pwa'
import type { BeforeInstallPromptEvent } from '@/types/pwa'

/**
 * Hold the browser install offer for a button to use later, count the visit
 * @return {void}
 */

export const useInstallOffer = (): void => {
  useEffect(() => {
    const { setInstallOffer } = usePwaStore.getState()
    useInstallHintStore.getState().countVisit()

    // Chromium only, the mini bar stays hidden
    const hold = (event: Event) => {
      event.preventDefault()
      setInstallOffer(event as BeforeInstallPromptEvent)
    }
    const installed = () => setInstallOffer(null)

    window.addEventListener('beforeinstallprompt', hold)
    window.addEventListener('appinstalled', installed)

    return () => {
      window.removeEventListener('beforeinstallprompt', hold)
      window.removeEventListener('appinstalled', installed)
    }
  }, [])
}
