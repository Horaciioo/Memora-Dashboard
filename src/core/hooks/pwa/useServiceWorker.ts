'use client'

import { useEffect } from 'react'

import { usePwaStore } from '@/core/store/pwa'
import { APP_VERSION } from '@/declarations/app'
import { APPLICATION_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { WORKER_FILE, WORKER_MESSAGES, WORKER_PARAMS } from '@/declarations/pwa/worker'

// Hashed chunks only exist in a production build
const IS_CACHING = process.env.NODE_ENV === 'production'

// This tab asked for the new version
let isRequested = false

/**
 * Worker address carrying its settings, a new version being a new address
 * @return {string} - Script address
 */

const workerUrl = (): string => {
  const query = new URLSearchParams({
    [WORKER_PARAMS.version]: APP_VERSION,
    [WORKER_PARAMS.offline]: ROUTES.offline,
    [WORKER_PARAMS.caching]: IS_CACHING ? '1' : '0',
  })

  return `${WORKER_FILE.script}?${query}`
}

/**
 * Follow a worker until it waits for the page to let it in
 * @param {ServiceWorkerRegistration} registration - Registration
 * @return {void}
 */

const watchWaiting = (registration: ServiceWorkerRegistration): void => {
  const { setWaiting } = usePwaStore.getState()

  // Only an update waits, a first install takes over at once
  const flag = () => {
    if (registration.waiting && navigator.serviceWorker.controller) setWaiting(registration.waiting)
    // A newer deploy replaced the one on offer, the banner would answer nothing
    else if (usePwaStore.getState().waiting?.state === 'redundant') setWaiting(null)
  }

  flag()
  registration.addEventListener('updatefound', () => {
    registration.installing?.addEventListener('statechange', flag)
  })

  // A manual reload keeps the old worker in charge, so it asks for the new one at once
  const { waiting } = usePwaStore.getState()
  const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  if (waiting && navigation?.type === 'reload') applyUpdate()
}

/**
 * Let the new version in, the page reloads once it leads
 * @return {void}
 */

export const applyUpdate = (): void => {
  const { waiting } = usePwaStore.getState()

  // Another tab already let it in
  if (!waiting || waiting.state === 'activated' || waiting.state === 'redundant') {
    return window.location.reload()
  }

  isRequested = true
  waiting.postMessage(WORKER_MESSAGES.skipWaiting)
}

/**
 * Register the service worker, look for updates on return and reload once the new one leads
 * @return {void}
 */

export const useServiceWorker = (): void => {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let lastCheck = Date.now()
    const hadController = Boolean(navigator.serviceWorker.controller)

    // A first install takes over silently, an update let in elsewhere keeps the banner
    const swap = () => {
      if (isRequested) return window.location.reload()
      if (hadController) usePwaStore.getState().setWaiting(navigator.serviceWorker.controller)
    }

    // Back in front, at most once per gap
    const check = () => {
      const { registration } = usePwaStore.getState()
      if (document.visibilityState !== 'visible' || !registration) return
      if (Date.now() - lastCheck < APPLICATION_SETTINGS.updateCheckMs) return

      lastCheck = Date.now()
      void registration.update().catch(() => undefined)
    }

    void navigator.serviceWorker
      .register(workerUrl(), { scope: WORKER_FILE.scope, updateViaCache: 'none' })
      .then((registration) => {
        usePwaStore.getState().setRegistration(registration)
        watchWaiting(registration)
      })
      .catch(() => undefined)

    navigator.serviceWorker.addEventListener('controllerchange', swap)
    document.addEventListener('visibilitychange', check)

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', swap)
      document.removeEventListener('visibilitychange', check)
    }
  }, [])
}
