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

// Where the last automatic swap is noted, and the gap before another one may run
const AUTO_KEY = 'memora:auto-update'
const AUTO_GAP_MS = 30_000

/**
 * Whether a reload may let the new version in by itself, once per gap so a bad deploy never loops
 * @return {boolean} - Allowed, and now noted
 */

const claimAutoUpdate = (): boolean => {
  try {
    const last = Number(window.sessionStorage.getItem(AUTO_KEY) ?? 0)
    if (Date.now() - last < AUTO_GAP_MS) return false
    window.sessionStorage.setItem(AUTO_KEY, String(Date.now()))
  } catch {
    return false
  }

  return true
}

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
  // A reload keeps the old worker in charge, so the new one is let in as soon as it waits, even late
  const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  const isReload = navigation?.type === 'reload'

  // Only an update waits, a first install takes over at once
  const flag = () => {
    if (registration.waiting && navigator.serviceWorker.controller) {
      setWaiting(registration.waiting)
      if (isReload && performance.now() < AUTO_GAP_MS && claimAutoUpdate()) applyUpdate()
    }
    // A newer deploy replaced the one on offer, the banner would answer nothing
    else if (usePwaStore.getState().waiting?.state === 'redundant') setWaiting(null)
  }

  flag()
  registration.addEventListener('updatefound', () => {
    registration.installing?.addEventListener('statechange', flag)
  })
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
