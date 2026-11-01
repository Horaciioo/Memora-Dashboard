'use client'

import { useEffect } from 'react'

import { usePwaStore } from '@/core/store/pwa'

/**
 * Keep the network state of the tab in the store
 * @return {void}
 */

export const useNetworkStatus = (): void => {
  useEffect(() => {
    const { setOnline } = usePwaStore.getState()
    const sync = () => setOnline(navigator.onLine)

    sync()
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)

    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [])
}
