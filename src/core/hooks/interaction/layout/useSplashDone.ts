'use client'

import { useSyncExternalStore } from 'react'

// Flag set while the splash shows
const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-splash'] })

  return () => observer.disconnect()
}

/**
 * Splash gone
 * @return {boolean} - True once the app shows
 */

export const useSplashDone = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.splash === undefined,
    () => false
  )
